import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../../lib/format.js";
import { freqFor } from "../../domain/intent.js";
import { secondsBefore, totalSeconds } from "../../domain/sequence.js";
import { useDemoAudio } from "../../hooks/useDemoAudio.js";
import { useTrackAudio } from "../../hooks/useTrackAudio.js";
import { useInterval } from "../../hooks/useInterval.js";

const SEEK_STEP = 15;

/**
 * Motori i player-it: kohëmatja, kalimi mes hapave, kontrolli i audios.
 *
 * E ndarë nga pamja me qëllim — logjika e luajtjes testohet pa DOM, dhe
 * `PlayerSheet` mbetet vetëm paraqitje.
 *
 * ═══ DY MOTORË, NJË NDËRFAQE ═══
 *
 * Kur meditimi ka skedar te serveri, luan skedari (`useTrackAudio`) dhe koha
 * lexohet nga ai. Kur nuk ka — meditimet pa audio, dhe blloqet e ndërtuesit —
 * luan gjeneratori i toneve dhe kohën e mban një timer.
 *
 * ⚠️  Zgjedhja bëhet KËTU, dhe `PlayerSheet` nuk e di fare. Përndryshe pamja
 *     do të duhej të mbante dy rrugë kodi për të njëjtin ekran.
 *
 * ⚠️  Kur luan skedari, timer-i FIKET.
 *
 *     Po të rrjedhnin bashkë, do të kishim dy të vërteta për të njëjtën kohë:
 *     `currentTime` e skedarit dhe numëruesi. Sapo shfletuesi ta ngadalësonte
 *     skedën në sfond, shiriti do të devijonte nga zëri.
 *
 * ⚠️  `useTrackAudio` SHPËRNDAHET në pjesë, nuk mbahet si objekt.
 *
 *     Objekti kthehet i ri në çdo render; po të hynte te varësitë, `goNext`
 *     do të ndryshonte identitet çdo render dhe bashkë me të do të rilidhej
 *     dëgjuesi i fundit e do të rifillonte intervali. Funksionet e hook-ut
 *     janë të qëndrueshme me qëllim, pikërisht që kjo shpërndarje të vlejë.
 *
 * Kalimi i hapit vendoset brenda callback-ut të timer-it, jo në një `useEffect`
 * që vëzhgon `elapsed`. Kështu shmangen render-et në kaskadë: një tik → një
 * përditësim. `elapsedRef` mban vlerën e freskët pa e rinisur intervalin.
 *
 * @param {object[]} sequence blloqet me `uid`
 * @param {() => void} onComplete thirret kur mbaron hapi i fundit
 */
export function usePlayerEngine(sequence, onComplete) {
  const [index, setIndex] = useState(0);
  const [tonePlaying, setTonePlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  /* A duhet të vazhdojë luajtja sapo audioja e hapit të radhës të vendoset.
     Ref, sepse vendimi merret përpara se `index` të ndryshojë dhe lexohet
     pasi mbërrin lidhja e re. */
  const continueRef = useRef(false);

  const { play: playTone, stop: stopTone } = useDemoAudio();

  const current = sequence[index];
  const {
    usable: real,
    status: audioStatus,
    reason: audioReason,
    duration: fileDuration,
    currentTime: fileTime,
    playing: filePlaying,
    play: playFile,
    pause: pauseFile,
    reset: resetFile,
    seekBy: seekFile,
    onEnded: onFileEnded,
    onSettled: onFileSettled,
  } = useTrackAudio(current?.id);

  /* Hapi i tanishëm te një ref, që dëgjuesit e mëposhtëm të mbeten të
     qëndrueshëm — shih shënimin te `handleSettled`. */
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  });

  const fallbackSeconds = (current?.dur ?? 1) * 60;
  /* Kohëzgjatja e vërtetë e skedarit mbizotëron mbi atë të databazës: ajo u
     fut me dorë dhe mund të mos përputhet me sekondën. */
  const blockSeconds = real && fileDuration > 0 ? fileDuration : fallbackSeconds;

  const playing = real ? filePlaying : tonePlaying;
  const hasNext = index < sequence.length - 1;

  /** Shkruan njëherësh në ref dhe në state, që të mos shkëputen. */
  const writeElapsed = useCallback((value) => {
    elapsedRef.current = value;
    setElapsed(value);
  }, []);

  const finish = useCallback(() => {
    continueRef.current = false;
    stopTone();
    pauseFile();
    setTonePlaying(false);
    onComplete();
  }, [stopTone, pauseFile, onComplete]);

  /**
   * Kalon te hapi tjetër.
   *
   * ⚠️  `wasPlaying` JEPET nga thirrësi dhe nuk lexohet nga gjendja.
   *
   *     Kur skedari mbaron vetë, elementi `<audio>` e vë `paused = true` dhe
   *     nxjerr `pause` PARA `ended` (kështu e kërkon specifikimi). Pra në
   *     çastin kur mbërrin `ended`, `playing` është tashmë `false` — dhe
   *     versioni i mëparshëm e lexonte pikërisht atje. Rezultati: hapi i dytë
   *     ngarkohej si duhet dhe rrinte i heshtur, ndaj seanca nuk përfundonte
   *     kurrë. E kapur me gjurmë te banka e provës, jo me lexim kodi.
   */
  const advance = useCallback(
    (wasPlaying) => {
      stopTone();
      setTonePlaying(false);
      resetFile();

      if (!hasNext) {
        finish();
        return;
      }

      /* Vendimi ruhet PARA se `index` të ndryshojë: hapi tjetër mund të kërkojë
         një lidhje të re, dhe kur ajo mbërrin, gjendja e vjetër nuk vlen më. */
      continueRef.current = wasPlaying;
      setIndex(index + 1);
      writeElapsed(0);
    },
    [stopTone, resetFile, hasNext, finish, index, writeElapsed]
  );

  /** Butoni "Përpara" dhe timer-i: vazhdimi varet nga gjendja e tanishme. */
  const goNext = useCallback(() => advance(playing), [advance, playing]);

  /* Skedari mbaroi vetë — pra po luhej me sigurí, pavarësisht `playing`. */
  const handleEnded = useCallback(() => advance(true), [advance]);
  useEffect(() => onFileEnded(handleEnded), [onFileEnded, handleEnded]);

  /**
   * Audioja e hapit të radhës u vendos: nis skedari, ose — kur del se skedar
   * nuk ka — nisin tonet.
   *
   * ⚠️  Vjen si CALLBACK nga `useTrackAudio`, dhe nuk vëzhgohet me efekt mbi
   *     `audioStatus`. Efekti do të kërkonte `setState` te trupi i vet — pra
   *     render-e në kaskadë në çdo kalim hapi — dhe do të varej nga radha e
   *     efekteve. Kështu vendimi merret atje ku ndodh ngjarja.
   *
   * ⚠️  Pritja e shkurtër kalon në HESHTJE me qëllim. Nisja e toneve sapo
   *     ndryshon hapi do të nxirrte një blip 220 Hz mes dy meditimeve, dhe
   *     pastaj do t'i mbivendosej skedari. Heshtja gjysmësekondëshe është e
   *     padukshme; blipi dëgjohet si defekt.
   *
   * Hapi lexohet nga `currentRef` që kjo funksion të mbetet i qëndrueshëm:
   * përndryshe do të rilidhej te hook-u në çdo hap.
   */
  const handleSettled = useCallback(
    (status) => {
      if (!continueRef.current) return;
      continueRef.current = false;

      if (status === "ready") {
        stopTone();
        setTonePlaying(false);
        playFile();
        return;
      }
      playTone(freqFor(currentRef.current?.intent));
      setTonePlaying(true);
    },
    [stopTone, playFile, playTone]
  );
  useEffect(() => onFileSettled(handleSettled), [onFileSettled, handleSettled]);

  /*
   * Timer-i rrjedh VETËM pa skedar. Shih shënimin lart: dy burime kohe për të
   * njëjtin shirit devijojnë sapo skeda humb fokusin.
   */
  useInterval(
    useCallback(() => {
      const next = elapsedRef.current + 1;
      if (next >= blockSeconds) {
        goNext();
        return;
      }
      writeElapsed(next);
    }, [blockSeconds, goNext, writeElapsed]),
    !real && tonePlaying ? 1000 : null
  );

  const toggle = useCallback(() => {
    if (real) {
      if (filePlaying) pauseFile();
      else playFile();
      return;
    }
    if (tonePlaying) {
      continueRef.current = false;
      stopTone();
      setTonePlaying(false);
      return;
    }
    /* Lidhja mund të jetë ende në rrugë: tonet nisin menjëherë që prekja të
       marrë përgjigje, dhe efekti më lart e kalon te skedari sapo mbërrin. */
    if (audioStatus === "loading") continueRef.current = true;
    /* `current?.intent`: `freqFor` ka rënien e vet te 120 Hz, ndaj një hap që
       mungon nxjerr zë e nuk nxjerr gabim. */
    playTone(freqFor(current?.intent));
    setTonePlaying(true);
  }, [real, filePlaying, pauseFile, playFile, tonePlaying, stopTone, audioStatus, playTone, current]);

  const seek = useCallback(
    (deltaSeconds) => {
      if (real) {
        seekFile(deltaSeconds);
        return;
      }
      writeElapsed(clamp(elapsedRef.current + deltaSeconds, 0, blockSeconds));
    },
    [real, seekFile, writeElapsed, blockSeconds]
  );

  /** Ndalon zërin pa e shënuar seancën si të përfunduar (mbyllje/minimizim). */
  const detach = useCallback(() => {
    continueRef.current = false;
    stopTone();
    pauseFile();
  }, [stopTone, pauseFile]);

  const blockElapsed = real ? Math.min(fileTime, blockSeconds) : Math.min(elapsed, blockSeconds);

  return {
    current,
    index,
    playing,
    /* koha brenda hapit aktual */
    blockElapsed,
    blockSeconds,
    blockPercent: blockSeconds > 0 ? (blockElapsed / blockSeconds) * 100 : 0,
    /* koha brenda seancës së plotë */
    overallElapsed: secondsBefore(sequence, index) + blockElapsed,
    overallSeconds: totalSeconds(sequence),
    toggle,
    goNext,
    seek,
    seekStep: SEEK_STEP,
    detach,
    /* Për shiritin te fundi i ekranit: audio e vërtetë apo tinguj demo. */
    realAudio: real,
    audioStatus,
    audioReason,
  };
}
