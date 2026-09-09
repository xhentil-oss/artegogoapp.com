import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAudioUrl, REASON } from "../services/audio.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  LUAJTJA E SKEDARIT TË VËRTETË
 * ═══════════════════════════════════════════════════════════════
 *
 * Drejton një element `<audio>` të vetëm për meditimin e tanishëm.
 *
 * ⚠️  Deri tani player-i luante VETËM tone demo (`useDemoAudio`) dhe mbante
 *     kohën me një timer. Pra `services/audio.js` — ai që merr lidhjen e
 *     nënshkruar — thirrej vetëm nga butoni "Shkarko". Kjo shpjegonte një
 *     sjellje që dukej e pakuptueshme: shkarkimi punonte, luajtja jo.
 *
 * ⚠️  KOHA VJEN NGA SKEDARI, jo nga një timer.
 *
 *     Një timer një-sekondësh devijon: nëse skeda humb fokusin, shfletuesi e
 *     ngadalëson, dhe shiriti do të tregonte 6:00 ndërsa zëri është te 7:20.
 *     `currentTime` e elementit është e vetmja e vërtetë.
 *
 * ⚠️  DËSHTIMI NUK E NDAL PLAYER-IN. Pa skedar (nuk është ngarkuar ende,
 *     kërkon abonim, ose mungon lidhja), `usable` mbetet `false` dhe motori
 *     kthehet te tonet — pra meditimet pa audio vazhdojnë të sillen si më
 *     parë, në vend që të mbeten pa asnjë zë.
 *
 * ⚠️  ÇDO FUNKSION I KTHYER ËSHTË I QËNDRUESHËM (deps bosh).
 *
 *     Thirrësi i fut te varësitë e `useCallback`-ave të vet. Po të
 *     rikrijoheshin në çdo render, `goNext` te motori do të ndryshonte
 *     identitet çdo render, dhe bashkë me të do të rilidhej dëgjuesi i
 *     "ended" e do të rifillonte intervali — pikërisht ajo rrjedhë që u hoq
 *     më 8 shtator 2026. Gjendja e ndryshueshme mbahet te `ref`, dhe jashtë
 *     nxjerrim vetëm vlera të thjeshta.
 *
 * ⚠️  «PO NGARKOHET» RRJEDH, NUK VENDOSET.
 *
 *     `loaded` shkruhet vetëm nga callback-e (përgjigjja e lidhjes, ngjarjet
 *     e elementit) dhe mban ID-në për të cilën vlen. Gjatë render-it,
 *     `loaded.id !== meditationId` do të thotë "po ngarkohet". Kështu asnjë
 *     `setState` nuk thirret te trupi i efektit — përndryshe çdo ndryshim
 *     hapi do të shkaktonte render-e në kaskadë, dhe pamja do të tregonte
 *     për një çast kohëzgjatjen e hapit të mëparshëm.
 */

/** Sa herë provohet një lidhje e re kur elementi dështon gjatë luajtjes. */
const MAX_RETRIES = 2;

const IDLE = { id: null, status: "idle", reason: null };

export function useTrackAudio(meditationId) {
  const elRef = useRef(null);
  /** Përdoruesi shtypi "Luaj" para se lidhja të mbërrinte. */
  const wantPlayRef = useRef(false);
  /** A ka elementi një `src` të vlefshme — që `play` të mos varet nga render-i. */
  const readyRef = useRef(false);
  /** Dëgjuesi i "ended", i vendosur nga motori përmes `onEnded`. */
  const endedRef = useRef(null);
  /** Dëgjuesi i "audioja u vendos", përmes `onSettled`. */
  const settledRef = useRef(null);
  /** Rimarrjet e lidhjes pas një dështimi, që të mos bëhen lak i pafund. */
  const retriesRef = useRef(0);
  /** Ku ishim kur lidhja u prish — koha rikthehet pas rimarrjes. */
  const resumeAtRef = useRef(0);
  /** Bileta e kërkesës së fundit; përgjigjet e vjetra e humbin garën. */
  const requestRef = useRef(0);

  const [loaded, setLoaded] = useState(IDLE);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  /*
   * Elementi krijohet një herë dhe ripërdoret: një `<audio>` e re për çdo hap
   * do të humbte lejen e luajtjes që dha prekja e përdoruesit — te iOS ajo
   * leje i takon elementit, jo faqes.
   */
  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    elRef.current = el;

    const onTime = () => setCurrentTime(el.currentTime);
    const onMeta = () => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
      /* Rikthimi te vendi ku ishim, pasi lidhja u rimarr. */
      if (resumeAtRef.current > 0) {
        try {
          el.currentTime = resumeAtRef.current;
        } catch {
          /* jashtë intervalit të lejuar — nis nga fillimi */
        }
        resumeAtRef.current = 0;
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      endedRef.current?.();
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.pause();
      el.removeAttribute("src");
      el.load();
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      readyRef.current = false;
      elRef.current = null;
    };
  }, []);

  /**
   * Merr një lidhje të nënshkruar dhe e vë te elementi.
   *
   * ⚠️  E ndarë nga efekti sepse thirret edhe nga trajtuesi i gabimit:
   *     lidhja skadon pas një ore, dhe një dëgjim i gjatë ose një kërcim te
   *     një pjesë e pa-shkarkuar do të merrte `410`. Pa këtë, zëri do të
   *     pushonte në mes pa shpjegim.
   *
   *     Këtu shkruhen vetëm `ref`-e; `setState` bëhet brenda callback-ut.
   */
  const load = useCallback((id, { autoplay = false } = {}) => {
    const ticket = ++requestRef.current;
    readyRef.current = false;

    if (!id) return;

    fetchAudioUrl(id).then((result) => {
      /* Meditimi ndërroi ndërkohë, ose komponenti u shkëput. */
      if (ticket !== requestRef.current) return;
      const el = elRef.current;
      if (!el) return;

      if (!result.ok) {
        setLoaded({ id, status: "unavailable", reason: result.reason });
        settledRef.current?.("unavailable");
        return;
      }

      el.src = result.url;
      el.load();
      readyRef.current = true;
      setDuration(0);
      setCurrentTime(0);
      setLoaded({ id, status: "ready", reason: null });
      /*
       * Lajmi shkon te motori si CALLBACK, jo si gjendje për t'u vëzhguar me
       * efekt. Kështu vendimi "vazhdo luajtjen te hapi tjetër" merret pikërisht
       * atje ku ndodh ngjarja, dhe motori nuk ka nevojë të thërrasë `setState`
       * te trupi i një efekti — gjë që `react-hooks/set-state-in-effect` e
       * ndal me arsye: do të shkaktonte render-e në kaskadë çdo hap.
       */
      settledRef.current?.("ready");

      if (autoplay || wantPlayRef.current) {
        el.play().catch(() => {
          /* Shfletuesi e refuzoi luajtjen pa prekje të drejtpërdrejtë. Nuk
             raportohet si mungesë skedari — skedari është aty; thjesht duhet
             një prekje e dytë. */
          setPlaying(false);
        });
      }
    });
  }, []);

  /* Lidhja kërkohet sapo ndryshon meditimi — jo në momentin e prekjes.
     Kështu, kur përdoruesi shtyp "Luaj", skedari është zakonisht gati, dhe
     te iOS prekja e tij mbetet brenda gjestit. */
  useEffect(() => {
    retriesRef.current = 0;
    resumeAtRef.current = 0;
    load(meditationId);

    /*
     * Një "Luaj" i mbetur pezull nuk duhet të zgjojë hapin tjetër.
     *
     * Përgjigjet në fluturim NUK anulohen këtu me dorë: `load` rrit biletën
     * në fillim të vet, ndaj një përgjigje e vjetër e humbet garën vetë. Kur
     * komponenti shkëputet, elementi është `null` — dhe cleanup-i i tij
     * rrjedh i pari, sepse efekti i tij është deklaruar më lart.
     */
    return () => {
      wantPlayRef.current = false;
    };
  }, [meditationId, load]);

  /*
   * Gabimi i elementit: lidhje e skaduar, rrjet i prishur, ose një pjesë që
   * shfletuesi provoi të marrë pas kërcimit. Provohet një lidhje e re nga po
   * ai vend — dhe vetëm dy herë, që një skedar që mungon vërtet të mos
   * kthehet në lak kërkesash.
   */
  useEffect(() => {
    const el = elRef.current;
    if (!el) return undefined;

    const onError = () => {
      if (!meditationId || !readyRef.current) return;
      if (retriesRef.current >= MAX_RETRIES) {
        readyRef.current = false;
        setLoaded({ id: meditationId, status: "unavailable", reason: REASON.MISSING });
        return;
      }
      retriesRef.current += 1;
      resumeAtRef.current = el.currentTime || 0;
      load(meditationId, { autoplay: !el.paused });
    };

    el.addEventListener("error", onError);
    return () => el.removeEventListener("error", onError);
  }, [meditationId, load]);

  const play = useCallback(() => {
    wantPlayRef.current = true;
    const el = elRef.current;
    if (!el || !readyRef.current) return;
    el.play().catch(() => setPlaying(false));
  }, []);

  const pause = useCallback(() => {
    wantPlayRef.current = false;
    elRef.current?.pause();
  }, []);

  /** Rikthen kohën në zero dhe ndalon — për kalimin te hapi tjetër. */
  const reset = useCallback(() => {
    wantPlayRef.current = false;
    const el = elRef.current;
    if (!el) return;
    el.pause();
    try {
      el.currentTime = 0;
    } catch {
      /* pa metadata ende, `currentTime` nuk shkruhet dot */
    }
    setCurrentTime(0);
  }, []);

  const seekBy = useCallback((deltaSeconds) => {
    const el = elRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    const next = Math.min(Math.max(el.currentTime + deltaSeconds, 0), el.duration);
    el.currentTime = next;
    setCurrentTime(next);
  }, []);

  /**
   * Vendos dëgjuesin për fundin e skedarit.
   *
   * Mban një `ref` në vend që t'i shtojë një dëgjues elementit: kështu
   * funksioni mbetet i qëndrueshëm dhe nuk varet nga cikli i jetës i
   * elementit, ndaj një ndryshim i `goNext` nuk e prek fare `<audio>`.
   */
  const onEnded = useCallback((handler) => {
    endedRef.current = handler;
    return () => {
      if (endedRef.current === handler) endedRef.current = null;
    };
  }, []);

  /**
   * Vendos dëgjuesin për çastin kur audioja e një meditimi vendoset —
   * `"ready"` ose `"unavailable"`.
   *
   * Motori e përdor për të vazhduar luajtjen te hapi tjetër: aty vendos nëse
   * nis skedari apo nisin tonet.
   */
  const onSettled = useCallback((handler) => {
    settledRef.current = handler;
    return () => {
      if (settledRef.current === handler) settledRef.current = null;
    };
  }, []);

  /*
   * Gjendja e nxjerrjes, e rrjedhur — shih shënimin lart. `loaded` i një
   * meditimi tjetër nuk vlen për këtë, ndaj lexohet si "po ngarkohet".
   */
  const settled = loaded.id === meditationId;
  const status = !meditationId ? "unavailable" : settled ? loaded.status : "loading";
  const reason = !meditationId ? REASON.LOCAL : settled ? loaded.reason : null;

  return {
    usable: status === "ready",
    status,
    reason,
    duration,
    currentTime,
    playing,
    play,
    pause,
    reset,
    seekBy,
    onEnded,
    onSettled,
  };
}
