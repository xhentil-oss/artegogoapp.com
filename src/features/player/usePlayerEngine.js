import { useCallback, useRef, useState } from "react";
import { clamp } from "../../lib/format.js";
import { freqFor } from "../../domain/intent.js";
import { secondsBefore, totalSeconds } from "../../domain/sequence.js";
import { useDemoAudio } from "../../hooks/useDemoAudio.js";
import { useInterval } from "../../hooks/useInterval.js";

const SEEK_STEP = 15;

/**
 * Motori i player-it: kohëmatja, kalimi mes hapave, kontrolli i audios.
 *
 * E ndarë nga pamja me qëllim — logjika e luajtjes testohet pa DOM, dhe
 * `PlayerSheet` mbetet vetëm paraqitje.
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
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  const { play: playTone, stop: stopTone } = useDemoAudio();

  const current = sequence[index];
  const blockSeconds = (current?.dur ?? 1) * 60;
  const hasNext = index < sequence.length - 1;

  /** Shkruan njëherësh në ref dhe në state, që të mos shkëputen. */
  const writeElapsed = useCallback((value) => {
    elapsedRef.current = value;
    setElapsed(value);
  }, []);

  const finish = useCallback(() => {
    stopTone();
    setPlaying(false);
    onComplete();
  }, [stopTone, onComplete]);

  const goNext = useCallback(() => {
    stopTone();
    if (!hasNext) {
      finish();
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    writeElapsed(0);
    if (playing) playTone(freqFor(sequence[nextIndex].intent));
  }, [stopTone, hasNext, finish, index, writeElapsed, playing, playTone, sequence]);

  /* një tik në sekondë; kalimi automatik vendoset po këtu */
  useInterval(
    useCallback(() => {
      const next = elapsedRef.current + 1;
      if (next >= blockSeconds) {
        goNext();
        return;
      }
      writeElapsed(next);
    }, [blockSeconds, goNext, writeElapsed]),
    playing ? 1000 : null
  );

  const toggle = useCallback(() => {
    if (playing) {
      stopTone();
      setPlaying(false);
      return;
    }
    playTone(freqFor(current.intent));
    setPlaying(true);
  }, [playing, stopTone, playTone, current]);

  const seek = useCallback(
    (deltaSeconds) => writeElapsed(clamp(elapsedRef.current + deltaSeconds, 0, blockSeconds)),
    [writeElapsed, blockSeconds]
  );

  /** Ndalon zërin pa e shënuar seancën si të përfunduar (mbyllje/minimizim). */
  const detach = useCallback(() => stopTone(), [stopTone]);

  const blockElapsed = Math.min(elapsed, blockSeconds);

  return {
    current,
    index,
    playing,
    /* koha brenda hapit aktual */
    blockElapsed,
    blockSeconds,
    blockPercent: (blockElapsed / blockSeconds) * 100,
    /* koha brenda seancës së plotë */
    overallElapsed: secondsBefore(sequence, index) + blockElapsed,
    overallSeconds: totalSeconds(sequence),
    toggle,
    goNext,
    seek,
    seekStep: SEEK_STEP,
    detach,
  };
}
