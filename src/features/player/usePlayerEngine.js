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

  /**
   * "Luaj vazhdimisht" — fundi e kthen seancën në fillim, pa e mbyllur.
   *
   * ⚠️  NJË PËRSËRITJE, JO PAFUND. Sapo seanca kthehet në fillim,
   *     ndërprerësi fiket vetë; të dëgjuarit e dytë mbaron si çdo i parë.
   *     Kështu e kërkoi klientja (17 nëntor 2026), pasi e pa në punë: një
   *     meditim që nuk ndalet kurrë është kurth — veçanërisht ai për gjumë,
   *     që dëgjohet në errësirë, kur askush nuk e prek më telefonin.
   *
   *     Fikja është edhe e vetmja shenjë që përsëritja ndodhi: ndërprerësi
   *     kthehet para syve, në çastin që zëri nis nga e para.
   *
   * ⚠️  NIS GJITHMONË E FIKUR, dhe fiket vetë sa herë hapet diçka tjetër.
   *     Nuk ruhet as te pajisja.
   *
   * ⚠️  Edhe si ref, jo vetëm si gjendje. `advance` krijohet me `useCallback`
   *     dhe lidhet si dëgjues i `ended`; po ta lexonte gjendjen, do të kapte
   *     vlerën e çastit kur u lidh — pra atë të ndërprerësit përpara prekjes.
   */
  const [looping, setLooping] = useState(false);
  const loopingRef = useRef(false);
  useEffect(() => {
    loopingRef.current = looping;
  }, [looping]);

  /* Sekuencë e re = meditim i ri: përsëritja kthehet e fikur. */
  useEffect(() => {
    setLooping(false);
  }, [sequence]);

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
    seekTo: seekFileTo,
    onEnded: onFileEnded,
    onSettled: onFileSettled,
    attachVideo,
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
  /**
   * Kthen seancën në fillim — zemra e "Luaj vazhdimisht".
   *
   * ⚠️  Dy rrugë, sepse `setIndex(0)` nuk bën asgjë kur indeksi është tashmë
   *     zero — dhe pikërisht ai është rasti i zakonshëm: një meditim i vetëm.
   *     Pa degën e dytë, ndërprerësi do të dukej se punon te seancat e
   *     ndërtuara dhe se nuk bën asgjë kudo tjetër.
   */
  const restart = useCallback(
    (wasPlaying) => {
      if (index > 0) {
        stopTone();
        setTonePlaying(false);
        resetFile();
        /* Si te `advance`: vendimi ruhet para se `index` të ndryshojë. */
        continueRef.current = wasPlaying;
        setIndex(0);
        writeElapsed(0);
        return;
      }

      writeElapsed(0);

      if (real) {
        seekFileTo(0);
        if (wasPlaying) playFile();
        return;
      }

      /* Tonet: gjeneratori nuk ka fund — mjafton t'i kthehet ora, dhe
         intervali vazhdon pa u prekur fare. */
    },
    [index, stopTone, resetFile, writeElapsed, real, seekFileTo, playFile]
  );

  const advance = useCallback(
    (wasPlaying) => {
      /*
       * Fundi i seancës, me përsëritjen të ndezur, nuk është fund.
       *
       * ⚠️  `loopingRef` shuhet KËTU, para `setLooping`. Gjendja përditësohet
       *     në render-in tjetër, dhe një skedar shumë i shkurtër mund ta
       *     nxirrte `ended` sërish para tij — pra një përsëritje e dytë që
       *     askush nuk e kërkoi.
       */
      if (!hasNext && loopingRef.current) {
        loopingRef.current = false;
        setLooping(false);
        restart(wasPlaying);
        return;
      }

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
    [stopTone, resetFile, hasNext, finish, index, writeElapsed, restart]
  );

  /** Butoni "Përpara" dhe timer-i: vazhdimi varet nga gjendja e tanishme. */
  const goNext = useCallback(() => advance(playing), [advance, playing]);

  /**
   * Hapi i mëparshëm — shigjeta ⏮.
   *
   * ⚠️  Te hapi i parë NUK del nga seanca: e rikthen atë hap në fillim, si
   *     çdo player muzike. Dalja do të ishte veprim tjetër nga ai që pret
   *     përdoruesi, dhe pa kthim.
   *
   * ⚠️  Nuk kalon nga `advance`: ai, kur nuk ka hap tjetër, e MBYLL seancën
   *     (`finish`). Prapa nuk ka asgjë të tillë për të bërë.
   */
  const goPrev = useCallback(() => {
    if (index === 0) {
      if (real) seekFileTo(0);
      else writeElapsed(0);
      return;
    }

    const wasPlaying = playing;
    stopTone();
    setTonePlaying(false);
    resetFile();
    /* Si te `advance`: vendimi ruhet para se `index` të ndryshojë. */
    continueRef.current = wasPlaying;
    setIndex(index - 1);
    writeElapsed(0);
  }, [index, real, seekFileTo, writeElapsed, playing, stopTone, resetFile]);

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

  /**
   * Kërcim te një sekondë e caktuar brenda hapit — shiriti i progresit.
   *
   * `seek` lëviz me hap (±15 s); kjo shkon aty ku e çon gishti. Të dyja i
   * shërbejnë të njëjtit kufi: koha mbetet brenda hapit aktual, nuk kalon te
   * hapi tjetër. Kalimi mes hapave bëhet vetëm nga `goNext` — përndryshe një
   * zvarritje deri në fund do të niste hapin pasardhës pa e kërkuar askush.
   *
   * ⚠️  Te tingujt demo (`real === false`) nuk ka skedar fare: aty lëviz
   *     numëruesi, dhe zëri vazhdon si ishte. Kjo është e qëllimshme — tonet
   *     nuk kanë "pozicion", vetëm shiriti ka.
   */
  const seekTo = useCallback(
    (seconds) => {
      const target = clamp(seconds, 0, blockSeconds);
      if (real) {
        seekFileTo(target);
        return;
      }
      writeElapsed(target);
    },
    [real, seekFileTo, writeElapsed, blockSeconds]
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
    goPrev,
    /* "Luaj vazhdimisht" — gjendja dhe ndërprerësi. */
    looping,
    toggleLoop: () => setLooping((on) => !on),
    /* Shigjetat ⏮/⏭ te pamja: cila prej tyre ka ku të shkojë. */
    hasNext,
    hasPrev: index > 0,
    seek,
    seekTo,
    seekStep: SEEK_STEP,
    detach,
    /* Për shiritin te fundi i ekranit: audio e vërtetë apo tinguj demo. */
    realAudio: real,
    audioStatus,
    audioReason,
    /* Kutia e figurës — vetëm fleta e madhe e përdor; mini-player-i jo. */
    attachVideo,
  };
}
