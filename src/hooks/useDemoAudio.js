import { useCallback, useEffect, useRef } from "react";

/**
 * Gjenerator toni demo (Web Audio API).
 *
 * Ndërton një shtresë të thjeshtë: dy oscilator të zhvendosur 4 Hz njëri nga
 * tjetri (efekt binaural), plus një sub-bas që pulson lehtë nga një LFO.
 * Është vend-mbajtës — kur audio reale të vijë nga backend-i, zëvendësoje
 * këtë hook me një që drejton një `<audio>` element ose Howler.
 */
export function useDemoAudio() {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const stop = useCallback(() => {
    nodesRef.current.forEach((node) => {
      try {
        node.stop?.();
      } catch {
        /* nyja mund të ketë përfunduar */
      }
      try {
        node.disconnect();
      } catch {
        /* nyja mund të jetë e shkëputur */
      }
    });
    nodesRef.current = [];
  }, []);

  const play = useCallback(
    (frequency) => {
      stop();

      const ctx = ensureContext(ctxRef);
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2);
      master.connect(ctx.destination);

      /* çifti binaural, i shpërndarë majtas/djathtas */
      [frequency, frequency + 4].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;

        const panner = ctx.createStereoPanner();
        panner.pan.value = i ? 0.4 : -0.4;

        const gain = ctx.createGain();
        gain.gain.value = 0.5;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(master);
        osc.start();
        nodesRef.current.push(osc);
      });

      /* sub-bas me pulsim të butë */
      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.value = frequency / 2;

      const subGain = ctx.createGain();
      subGain.gain.value = 0.08;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;

      lfo.connect(lfoGain);
      lfoGain.connect(subGain.gain);
      sub.connect(subGain);
      subGain.connect(master);
      sub.start();
      lfo.start();

      nodesRef.current.push(sub, lfo, master);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return { play, stop };
}

function ensureContext(ref) {
  if (ref.current) return ref.current;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    ref.current = new Ctor();
    return ref.current;
  } catch {
    /* browser-i nuk e mbështet Web Audio — player-i punon pa zë */
    return null;
  }
}
