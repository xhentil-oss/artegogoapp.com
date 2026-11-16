import {
  Bookmark,
  ChevronLeft,
  Download,
  Headphones,
  Info,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { T, layout, onDark, radii, shadows } from "../../theme/tokens.js";
import { sx, circle } from "../../theme/styles.js";
import { tile, immersiveBackdrop } from "../../theme/gradients.js";
import { FLUID, padTop, padBottom } from "../../theme/responsive.js";
import { fmt } from "../../lib/format.js";
import { shareText } from "../../lib/share.js";
import { REASON, REASON_TEXT } from "../../services/audio.js";
import { removeOffline, storeOffline, supportsOffline } from "../../services/offlineAudio.js";
import { intentMeta } from "../../domain/intent.js";
import { breathStateAt, breathingFor } from "../../domain/breathing.js";
import { usePlayer } from "../../store/PlayerContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useCollections } from "../../store/CollectionsContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEffect, useRef, useState } from "react";
import { usePlayerEngine } from "./usePlayerEngine.js";
import { BreathBox, BreathSteps } from "./BreathBox.jsx";

/**
 * Player-i imersiv. E gjithë kohëmatja jeton në `usePlayerEngine`;
 * ky komponent është vetëm pamje.
 */
export function PlayerSheet({ sequence }) {
  const { minimize, complete } = usePlayer();
  const engine = usePlayerEngine(sequence, complete);
  const { isFavorite, toggleFavorite, isDownloaded, toggleDownload } = useCollections();
  const { openUpsell } = useNavigation();
  useBodyScrollLock();

  /* Të dyja listat i takojnë meditimit që po luhet tani, jo gjithë seancës. */
  const currentId = engine.current?.id;
  const favorite = currentId ? isFavorite(currentId) : false;
  const downloaded = currentId ? isDownloaded(currentId) : false;

  const meta = intentMeta(engine.current?.intent);
  const Icon = meta.icon;

  /*
   * Kopertina e diskut.
   *
   * ⚠️  Dështimi mbahet PËR ID, jo si flamur i thjeshtë. Me një flamur, një
   *     kopertinë që mungon te hapi i parë do të fshihte edhe atë të hapit të
   *     dytë, sepse gjendja nuk do të rinisej kurrë brenda të njëjtës seancë.
   */
  const [kopertinaDeshtoi, setKopertinaDeshtoi] = useState(null);
  const kopertina =
    engine.current?.cover && kopertinaDeshtoi !== currentId ? engine.current.cover : null;

  /**
   * UDHËZUESI I FRYMËMARRJES — vetëm për meditimet që e kërkojnë.
   *
   * Koha vjen nga `blockElapsed`, pra nga pozicioni i vërtetë i skedarit:
   * ndalimi, kthimi 15 sekonda prapa dhe nisja e vonuar e ndjekin vetvetiu.
   * Shih `domain/breathing.js`.
   */
  const ritmi = breathingFor(engine.current);
  const fryma = ritmi ? breathStateAt(ritmi, engine.blockElapsed) : null;

  /**
   * MEDITIMET ME FIGURË.
   *
   * Flamuri vjen nga katalogu, jo nga përgjigjja e `/audio/:id` — pra dihet
   * para se lidhja të mbërrijë. Po ta prisnim atë, fleta do të hapej me
   * diskun e zakonshëm dhe do të kërcente te figura një sekondë më vonë.
   *
   * Frymëmarrja ka përparësi: po të kishte një meditim edhe me ritëm edhe me
   * video, udhëzuesi është ai që duhet parë.
   */
  const video = !ritmi && Boolean(engine.current?.hasVideo);

  /*
   * Figura futet te kutia nga një efekt, pasi React-i ta ketë vendosur atë.
   *
   * ⚠️  Elementi `<video>` i takon `useTrackAudio`-s, që e krijon një herë dhe
   *     e mban gjatë gjithë seancës. Po ta vizatonte React-i, çdo ndryshim
   *     hapi do të krijonte element të ri — dhe te iOS leja e luajtjes, që i
   *     takon elementit, do të humbiste me të: përdoruesi do të duhej të
   *     shtypte "Luaj" dy herë, pa asnjë arsye të dukshme.
   */
  const kutiaFigures = useRef(null);
  const { attachVideo } = engine;
  useEffect(() => attachVideo(kutiaFigures.current), [attachVideo, video]);

  const close = () => {
    engine.detach();
    minimize();
  };

  /**
   * Konfirmim i shkurtër.
   *
   * ⚠️  Të tre butonat më parë vepronin NË HESHTJE — shpërndarja e hidhte
   *     rezultatin e vet poshtë, dhe shkarkimi vetëm ndizte një flamur. Një
   *     veprim që nuk thotë asgjë duket i prishur edhe kur ka punuar.
   */
  const [flash, setFlash] = useState(null);
  /*
   * ⚠️  Ora e mëparshme ANULOHET.
   *
   *     Pa këtë, dy mesazhe brenda 2 sekondash përplaseshin: ora e të parit
   *     fshinte të dytin pothuajse sapo dilte. Shkarkimi tani flet dy herë —
   *     "po ruhet" dhe pastaj rezultati — ndaj kjo u bë e dukshme.
   */
  const flashTimer = useRef(null);
  const say = (message, ms = 2600) => {
    clearTimeout(flashTimer.current);
    setFlash(message);
    flashTimer.current = setTimeout(() => setFlash(null), ms);
  };
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const [downloading, setDownloading] = useState(false);

  /**
   * Shkarkimi BRENDA aplikacionit.
   *
   * ⚠️  Nuk ruan më asgjë te telefoni. Më parë skedari shkonte te dosja
   *     "Downloads", pra dilte nga aplikacioni dhe dëgjohej e shpërndahej pa
   *     abonim. Tani kopja rri te kujtesa e aplikacionit (`offlineAudio.js`)
   *     dhe player-i e lexon prej saj kur nuk ka internet.
   *
   * ⚠️  Regjistrimi te `/me/downloads` bëhet VETËM pas suksesit. Më parë
   *     flamuri ndizej menjëherë, ndaj profili tregonte një meditim "të
   *     shkarkuar" që nuk ekzistonte askund në pajisje.
   */
  const download = async () => {
    if (!engine.current || downloading) return;

    if (downloaded) {
      await removeOffline(currentId);
      toggleDownload(currentId);
      say("Hequr nga të shkarkuarat");
      return;
    }

    if (!supportsOffline()) {
      say("Kjo pajisje nuk e lejon ruajtjen brenda aplikacionit.");
      return;
    }

    /*
     * ⚠️  Flitet PARA se të niset, dhe ikona bëhet orë.
     *
     *     Një meditim 9-minutësh është rreth 8MB: me internet celulari kalojnë
     *     dhjetëra sekonda gjatë të cilave asgjë nuk ndryshonte në ekran.
     *     Klientja shtypi dhe pa "asgjë" (16 nëntor 2026) — butoni po punonte,
     *     por heshturazi.
     */
    setDownloading(true);
    say("Po ruhet në aplikacion…", 60000);

    let result;
    try {
      result = await storeOffline(engine.current);
    } catch (err) {
      /* Asnjë rrugë nuk mbetet e heshtur: edhe një përjashtim i papritur
         shkruhet në ekran, përndryshe butoni duket i prishur pa asnjë shenjë. */
      result = { ok: false, reason: null, detail: String(err?.message ?? err) };
    }
    setDownloading(false);

    if (result.ok) {
      toggleDownload(currentId);
      say("U ruajt në aplikacion — dëgjohet edhe pa internet");
      return;
    }
    /* 402 nga serveri nuk është gabim për t'u treguar — është ftesë. */
    if (result.reason === REASON.PREMIUM) {
      setFlash(null);
      openUpsell();
      return;
    }
    say(result.detail ?? REASON_TEXT[result.reason] ?? "Ruajtja nuk u krye.", 5000);
  };

  /** Ruaj te të preferuarat — shfaqet te Profili, dhe shkon te databaza. */
  const favoriteToggle = () => {
    if (!currentId) return;
    toggleFavorite(currentId);
    say(favorite ? "Hequr nga të preferuarat" : "Ruajtur te të preferuarat");
  };

  /**
   * Shpërndan meditimin aktual me fletën native, ose e kopjon.
   *
   * Lidhja është faqja e aplikacionit, jo një lidhje e drejtpërdrejtë drejt
   * meditimit: nuk ka ende rrugë që ta hapë një meditim nga URL-ja, dhe një
   * lidhje që nuk çon askund është më keq se asnjë.
   */
  const share = async () => {
    const result = await shareText({
      title: "Arte Gogo",
      text: `${engine.current?.title} — ${meta.label}\n${engine.current?.desc ?? ""}`,
      url: window.location.origin,
    });
    if (result === "shared") say("U shpërnda");
    else if (result === "copied") say("Teksti u kopjua");
    else if (result === "failed") say("Shpërndarja nuk u krye");
  };

  return (
    <div
      className="ag-sheet ag-fullscreen"
      style={{
        zIndex: 60,
        background: immersiveBackdrop(meta.g),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        /* safe-area: notch lart, shiriti i gjesteve poshtë */
        padding: `${padTop(20)} 26px ${padBottom(36)}`,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/*
        Konfirmimi. Brenda fletës dhe me `position: fixed`, që të mos zhvendoset
        kur përmbajtja poshtë rrëshqet.
      */}
      {flash && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: `calc(${padBottom(36)} + 78px)`,
            zIndex: 80,
            maxWidth: "88%",
            padding: "10px 18px",
            borderRadius: radii.pill,
            background: "rgba(12,10,24,0.92)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            textAlign: "center",
            boxShadow: shadows.immersive,
            pointerEvents: "none",
          }}
        >
          {flash}
        </div>
      )}

      {/* ---------- shiriti i sipërm ---------- */}
      <div
        style={{
          width: "100%",
          maxWidth: layout.sheetMaxWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <button
          onClick={close}
          aria-label="Minimizo player-in"
          style={{ ...sx.bareButton, ...sx.center, width: 44, height: 44, marginLeft: -10 }}
        >
          <ChevronLeft size={28} color="#fff" />
        </button>

        <div style={{ display: "flex", gap: 14 }}>
          <OutlineCircle
            onClick={download}
            label={downloading ? "Po shkarkohet…" : downloaded ? "Hiq nga të shkarkuarat" : "Shkarko"}
            active={downloaded}
          >
            {downloading ? (
              <Loader2 size={17} color="#fff" className="ag-spin" />
            ) : (
              <Download size={17} color={downloaded ? T.gold : "#fff"} />
            )}
          </OutlineCircle>

          <OutlineCircle onClick={share} label="Shpërndaj">
            <Share2 size={17} color="#fff" />
          </OutlineCircle>

          <OutlineCircle
            onClick={favoriteToggle}
            label={favorite ? "Hiq nga të preferuarat" : "Ruaj te të preferuarat"}
            active={favorite}
          >
            <Bookmark size={17} color={favorite ? T.gold : "#fff"} fill={favorite ? T.gold : "none"} />
          </OutlineCircle>
        </div>
      </div>

      {/* ---------- disku ---------- */}
      {/* përmasa relative ndaj fletës: 240px kur ka hapësirë, 74% kur ngushtohet */}
      {/*
        Te një ushtrim, disku NUK vizatohet si kartë (kërkesë e klientes, 12
        tetor 2026).

        ⚠️  Korniza, hija dhe sfondi me gradient ekzistojnë për të mbajtur një
            KOPERTINË — një foto ka nevojë për buzë që të ndahet nga faqja.
            Udhëzuesi i frymëmarrjes nuk është foto: është vizatim i hapur, dhe
            brenda një katrori të mbyllur duket si figurë e ngujuar.

            Bie edhe pulsimi `breathe`: figura ka lëvizjen e vet, dhe dy ritme
            të pavarura mbi të njëjtin element e prishin njëri-tjetrin.

            Pa kartë, hapësira lirohet — ndaj zë pak më shumë gjerësi, që
            numrat dhe etiketat të lexohen me një shikim.
      */}
      <div
        style={{
          /*
              Videoja është vertikale (9:16), ndaj kutia merr atë raport dhe
              matet me LARTËSI, jo me gjerësi: me një gjerësi fikse, te një
              telefon i ngushtë figura do të dilte poshtë butonave. `vh` e
              lidh me ekranin, kufiri në piksel e ndal te tabletët.
          */
          ...(video
            ? { height: "min(44vh, 400px)", aspectRatio: "9 / 16" }
            : {
                width: ritmi ? "min(300px, 88%)" : FLUID.playerDisc,
                aspectRatio: "1 / 1",
              }),
          maxWidth: layout.sheetMaxWidth,
          marginTop: 14,
          marginBottom: 28,
          flexShrink: 0,
          ...sx.center,
          position: "relative",
          ...(ritmi
            ? {}
            : {
                borderRadius: 28,
                background: tile(meta.g),
                boxShadow: engine.playing
                  ? `${shadows.immersive}, 0 0 80px ${meta.g[0]}99`
                  : shadows.immersive,
                overflow: "hidden",
                /*
                    Pa pulsim kur ka figurë: videoja ka lëvizjen e vet, dhe dy
                    ritme mbi të njëjtin element e prishin njëri-tjetrin — i
                    njëjti rregull si te `BreathBox` më lart.
                */
                animation: engine.playing && !video ? "breathe 6s ease-in-out infinite" : "none",
                transition: "box-shadow .6s ease",
              }),
        }}
      >
        {/*
            Kur meditimi ka kopertinë, ajo ZË VENDIN e diskut — nuk shkon
            poshtë tij.

            ⚠️  Unaza që rrotullohet dhe rrezet janë zbukurim për rastin kur
                nuk ka foto. Po t'i mbanim mbi një kopertinë të vërtetë, do të
                mbulonin pikërisht qendrën e saj, atje ku fotografi vendos
                subjektin. Fryma e diskut (`breathe`) dhe shkëlqimi mbeten —
                ato tregojnë se po luhet, pa i hipur imazhit.

            ⚠️  `onError` e kthen te disku: një kopertinë e pangarkuar ose një
                emër i shkruar gabim nuk duhet të lërë katror bosh. I njëjti
                rregull si te `CoverArt`.
        */}
        {ritmi ? (
          /* Katrori zë vendin e kopertinës: ushtrimi është vetë përmbajtja. */
          <BreathBox pattern={ritmi} elapsed={engine.blockElapsed} playing={engine.playing} />
        ) : video ? (
          /*
              Kutia e figurës, e zbrazët te JSX-ja: elementin e fut efekti më
              lart. Kopertina dhe disku nuk vizatohen fare — figura është vetë
              përmbajtja, dhe zëri ndodhet brenda saj.
          */
          <div className="ag-video-host" ref={kutiaFigures} />
        ) : kopertina ? (
          <>
            <img
              src={kopertina}
              alt=""
              onError={() => setKopertinaDeshtoi(currentId)}
              style={{ ...sx.absoluteFill, width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Shtresë e lehtë poshtë: pa të, titulli i bardhë humbet mbi
                kopertinat e ndritshme. */}
            <div
              style={{
                ...sx.absoluteFill,
                background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.28) 100%)",
              }}
            />
          </>
        ) : (
          <>
            <div
              style={{
                ...sx.absoluteFill,
                background:
                  "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.05) 0deg 6deg, transparent 6deg 12deg)",
              }}
            />
            <div
              style={{
                width: FLUID.playerRing,
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                background:
                  "conic-gradient(from 0deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3), rgba(255,255,255,0.9))",
                ...sx.center,
                animation: engine.playing ? "spin 16s linear infinite" : "none",
              }}
            >
              <div
                style={{
                  width: FLUID.playerCore,
                  aspectRatio: "1 / 1",
                  borderRadius: "50%",
                  background: tile(meta.g),
                  ...sx.center,
                }}
              >
                <Icon size={40} color="#fff" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---------- titulli ---------- */}
      <h2
        style={{
          fontSize: "clamp(21px, 6.5vw, 26px)",
          color: "#fff",
          margin: "0 0 8px",
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {engine.current?.title}
      </h2>
      {/*
        Firma — VETËM kur nuk ka udhëzues frymëmarrjeje.

        ⚠️  Te një ushtrim, poshtë titullit vijnë menjëherë katër hapat, dhe ata
            janë e vetmja gjë që duhet lexuar atje.

        ⚠️  PËRSHKRIMI NUK SHFAQET MË KËTU (kërkesë e klientes, 13 nëntor 2026).
            Qëndroi deri atëherë si paragraf nën firmën. Por njeriu e ka lexuar
            tashmë te fleta e meditimit, pikërisht para se të shtypte "Luaj" —
            dhe këtu, me sy gjysmë të mbyllur, ai bllok teksti vetëm zgjat
            ekranin dhe shtyn kontrollet poshtë. `description` mbetet te
            databaza dhe te `MeditationSheet`; hiqet vetëm nga luajtësi.

            Po të duhet prapë, kthehet duke e vënë sërish paragrafin me
            `engine.current?.desc` poshtë firmës — asgjë tjetër nuk u prek.
      */}
      {!ritmi && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <div style={circle(24, tile(meta.g))}>
            {/* Logoja e hyrjes — e njëjta si te "Krijo" dhe te postimet: e zezë
                mbi sfond të tejdukshëm, ndaj kthehet e bardhë me filtër. */}
            <img
              src="/transparent-logo-2.png"
              alt=""
              aria-hidden="true"
              style={{ height: 14, width: "auto", filter: "brightness(0) invert(1)" }}
            />
          </div>
          <span style={{ color: onDark.primary, fontSize: 15 }}>Arte Gogo · {meta.label}</span>
        </div>
      )}

      {/*
        Hapat e ushtrimit — vetëm për meditimet me ritëm të matur.

        Rri jashtë diskut sepse figura është katror dhe lista është e gjatë:
        brenda saj do të duhej shkronja aq e vogël sa nuk lexohet me sy
        gjysmë të mbyllur — pikërisht gjendja për të cilën është bërë.
      */}
      {ritmi && <BreathSteps pattern={ritmi} activeIndex={fryma?.done ? -1 : fryma?.index} />}

      {/* ---------- kontrollet ---------- */}
      {/*
        Hapësira ngushtohet VETËM kur shtohen dy butona.
        Me tre butona rreshti mbetet si ka qenë; me pesë, 84+42+42+44+44 pikselë
        bashkë me hapësirat e vjetra do të dilnin jashtë ekranit 360-pikselësh.
      */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: sequence.length > 1 ? "clamp(8px, 3.5vw, 18px)" : "clamp(18px, 7vw, 30px)",
          margin: "36px 0 28px",
        }}
      >
        {/*
          ⏮/⏭ — kalimi te meditimi i mëparshëm ose i radhës brenda seancës
          (kërkesë e klientes, 16 nëntor 2026).

          ⚠️  Dalin VETËM kur seanca ka më shumë se një meditim. Një seancë me
              një meditim të vetëm — rasti më i zakonshëm, kur hapet nga
              biblioteka — nuk ka ku të shkojë, dhe dy butona përherë të
              zbehtë do të dukeshin si defekt.

          ⚠️  Te meditimi i parë, ⏮ nuk del nga seanca: e rikthen atë në
              fillim, si çdo player muzike.
        */}
        {sequence.length > 1 && (
          <SkipButton
            label="Meditimi i mëparshëm"
            onClick={engine.goPrev}
            icon={<SkipBack size={19} color="#fff" fill="#fff" />}
          />
        )}
        <SeekButton direction="back" seconds={engine.seekStep} onClick={() => engine.seek(-engine.seekStep)} />
        <button
          onClick={engine.toggle}
          className="ag-press"
          style={{
            ...circle(84, "#fff"),
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          }}
        >
          {engine.playing ? (
            <Pause size={34} color={meta.g[1]} />
          ) : (
            <Play size={34} color={meta.g[1]} style={{ marginLeft: 4 }} />
          )}
        </button>
        <SeekButton direction="forward" seconds={engine.seekStep} onClick={() => engine.seek(engine.seekStep)} />
        {sequence.length > 1 && (
          <SkipButton
            label="Meditimi tjetër"
            onClick={engine.goNext}
            disabled={!engine.hasNext}
            icon={<SkipForward size={19} color="#fff" fill="#fff" />}
          />
        )}
      </div>

      {/* ---------- shënim mbi audion ---------- */}
      {/*
        SHFAQET VETËM KUR KA DIÇKA PËR TË THËNË (kërkesë e klientes, 12 tetor
        2026).

        ⚠️  "Audio e plotë" nuk informon askënd: zëri dëgjohet, dhe shiriti
            thjesht e përsërit atë që veshi e di. Por kur audioja nuk luhet —
            e pangarkuar, e kyçur pas abonimit, ose ende duke u hapur — ky
            është i vetmi vend që e thotë. Nga 250 meditime, vetëm pak kanë
            skedar; pa këtë rresht, të tjerët do të luanin tinguj demo pa asnjë
            shpjegim dhe do të dukeshin të prishur.

            Pra hiqet pikërisht rasti i panevojshëm, jo vetë sinjali.
      */}
      {!engine.realAudio && (
      <div
        style={{
          width: "100%",
          maxWidth: layout.sheetMaxWidth,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 11,
            background: onDark.fill,
            borderRadius: radii.pill,
            padding: "13px 18px",
          }}
        >
          <Headphones size={18} color={onDark.secondary} />
          <span style={{ color: onDark.secondary, fontSize: 13.5 }}>
            {/*
                Shiriti thotë ÇFARË po luan vërtet.

                ⚠️  Më parë shkruante gjithmonë "Tinguj demo", edhe kur skedari
                    ekzistonte — sepse player-i nuk luante fare skedarë. Tani
                    gjendja vjen nga motori, ndaj nuk gënjen dot: nëse thotë
                    demo, demo është.
            */}
            {engine.audioStatus === "loading"
              ? "Po hapet audioja…"
              : (REASON_TEXT[engine.audioReason] ?? "Tinguj demo")}
          </span>
        </div>
        <div style={circle(50, onDark.fill)}>
          <Info size={19} color={onDark.secondary} />
        </div>
      </div>
      )}

      {/* ---------- progresi ---------- */}
      <div style={{ width: "100%", maxWidth: layout.sheetMaxWidth }}>
        <ProgressBar
          percent={engine.blockPercent}
          elapsed={engine.blockElapsed}
          seconds={engine.blockSeconds}
          onSeek={(fraction) => engine.seekTo(fraction * engine.blockSeconds)}
        />

        {/* hapat e seancës, në proporcion me kohëzgjatjen */}
        <div style={{ display: "flex", gap: 3, marginTop: 12 }}>
          {sequence.map((block, i) => (
            <div
              key={block.uid}
              style={{
                flex: block.dur,
                height: 3,
                borderRadius: 2,
                background:
                  i < engine.index ? "#fff" : i === engine.index ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", color: onDark.muted, fontSize: 12, marginTop: 10 }}>
          Hapi {engine.index + 1} nga {sequence.length} · {fmt(engine.overallElapsed)} /{" "}
          {fmt(engine.overallSeconds)}
        </div>
      </div>
    </div>
  );
}


/**
 * Shiriti i progresit — i prekshëm, jo vetëm pamje.
 *
 * Deri më 16 nëntor 2026 lëvizja bëhej vetëm me dy butonat ±15 s. Te një
 * meditim nëntëminutësh, kthimi te një pjesë e dëgjuar më parë kërkonte
 * dhjetëra prekje. Tani shiriti pranon edhe prekje të vetme (kërce aty) edhe
 * zvarritje (lëviz me gisht), me të njëjtin kod — `pointer`-at i mbulojnë të
 * dyja, maus e gisht.
 *
 * ⚠️  `touchAction: "none"` është i domosdoshëm te telefoni. Pa të, shfletuesi
 *     e merr gjestin si rrëshqitje të faqes dhe `pointermove` nuk vjen kurrë:
 *     shiriti do të kërcente te prekja, por nuk do të zvarritej dot.
 *
 * ⚠️  `setPointerCapture` mban gishtin të lidhur me shiritin edhe kur del
 *     jashtë tij. Pa të, zvarritja pak më lart ose poshtë e humb ndjekjen në
 *     mes, dhe koha mbetet aty ku ishte kur gishti doli.
 *
 * ⚠️  ZONA E PREKJES ËSHTË 34 px, JO 6. Shiriti vizatohet 6 px i hollë, por
 *     `padding: "14px 0"` me `margin: "-14px 0"` e zgjeron zonën pa e lëvizur
 *     asgjë në ekran. Gishti nuk e gjen dot një vijë gjashtëpikëshe.
 *
 * ⚠️  GJATË ZVARRITJES ANIMACIONI HIQET. Kalimi `1s linear` ekziston që
 *     shiriti të rrjedhë butë me kohën; nën gisht ai do të bënte që koka të
 *     ngelej një sekondë pas gishtit. Prandaj `transition` bëhet "none"
 *     sapo nis prekja, dhe kthehet sapo lëshohet.
 *
 * Koha majtas ndjek gishtin ndërsa zvarrit — pa të, nuk dihet se ku po shkon
 * derisa ta lëshosh.
 */
function ProgressBar({ percent, elapsed, seconds, onSeek }) {
  const barRef = useRef(null);
  /* 0–100 vetëm gjatë zvarritjes; `null` do të thotë "ndiq motorin". */
  const [drag, setDrag] = useState(null);

  const fractionAt = (clientX) => {
    const r = barRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return 0;
    return Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
  };

  const pos = drag ?? percent;
  const koha = drag === null ? elapsed : (drag / 100) * seconds;
  /*
   * ⚠️  "0s", JO "none".
   *
   *     Këtu rrinte `"none"`, dhe dilte `transition: width none` — vlerë e
   *     pavlefshme CSS. Një vlerë e pavlefshme nuk e fik vetinë: shfletuesi e
   *     shpërfill fare dhe mban atë të mëparshmen, pra `width 1s linear`.
   *     Rrjedhimisht shiriti vinte pas gishtit me një sekondë vonesë dhe nuk
   *     mbushej kurrë aty ku e çoje — pikërisht ankesa e klientes
   *     (16 nëntor 2026). `0s` është vlerë e vlefshme dhe do të thotë
   *     "menjëherë".
   */
  const kalim = drag === null ? "1s linear" : "0s";

  const hap = (delta) => {
    const next = Math.min(Math.max(pos + delta, 0), 100);
    setDrag(null);
    onSeek(next / 100);
  };

  return (
    <>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Pozicioni i meditimit"
        aria-valuemin={0}
        aria-valuemax={Math.round(seconds)}
        aria-valuenow={Math.round(koha)}
        aria-valuetext={`${fmt(koha)} nga ${fmt(seconds)}`}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          hap(e.key === "ArrowRight" ? 2 : -2);
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag(fractionAt(e.clientX) * 100);
        }}
        onPointerMove={(e) => {
          if (drag === null) return;
          setDrag(fractionAt(e.clientX) * 100);
        }}
        onPointerUp={(e) => {
          if (drag === null) return;
          const f = fractionAt(e.clientX);
          setDrag(null);
          onSeek(f);
        }}
        onPointerCancel={() => setDrag(null)}
        style={{
          padding: "14px 0",
          margin: "-14px 0",
          cursor: "pointer",
          touchAction: "none",
          outline: "none",
        }}
      >
        <div
          ref={barRef}
          style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 4 }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pos}%`,
              background: "#fff",
              borderRadius: 4,
              transition: `width ${kalim}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${pos}%`,
              top: "50%",
              /* koka rritet nën gisht — e vetmja shenjë që prekja u kap */
              width: drag === null ? 16 : 20,
              height: drag === null ? 16 : 20,
              borderRadius: "50%",
              background: "#fff",
              transform: "translate(-50%,-50%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: `left ${kalim}, width 120ms, height 120ms`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          color: onDark.secondary,
          fontSize: 14,
        }}
      >
        <span>{fmt(koha)}</span>
        <span>{fmt(seconds)}</span>
      </div>
    </>
  );
}

/**
 * Shigjeta ⏮/⏭.
 *
 * E zbehur dhe e paprekshme kur nuk ka ku të shkojë — te meditimi i fundit.
 * Fshehja do ta zhvendoste rreshtin e kontrolleve sapo të mbërrije aty, dhe
 * butoni "Luaj" nuk duhet të lëvizë nën gisht.
 */
function SkipButton({ onClick, icon, label, disabled = false }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={disabled ? undefined : "ag-press"}
      style={{
        ...circle(44, "none"),
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.3 : 1,
        transition: "opacity .2s",
      }}
    >
      {icon}
    </button>
  );
}

function OutlineCircle({ onClick, children, label, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="ag-press"
      style={{
        ...circle(42, active ? "rgba(224,169,60,0.18)" : "none"),
        border: `1.5px solid ${active ? T.gold : onDark.hairline}`,
        padding: 0,
        cursor: onClick ? "pointer" : "default",
        transition: "background .2s, border-color .2s",
      }}
    >
      {children}
    </button>
  );
}

/** Kërcim ±15s — numri shkruhet brenda ikonës rrethore. */
function SeekButton({ direction, seconds, onClick }) {
  const Icon = direction === "back" ? RotateCcw : RotateCw;
  return (
    <button onClick={onClick} style={{ ...sx.bareButton, position: "relative" }}>
      <Icon size={40} color={onDark.primary} strokeWidth={1.4} />
      <span
        style={{
          position: "absolute",
          inset: 0,
          ...sx.center,
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          paddingTop: 2,
        }}
      >
        {seconds}
      </span>
    </button>
  );
}
