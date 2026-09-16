import { User } from "lucide-react";
import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { dayPart } from "../../lib/time.js";
import { greetingFor, quoteOfDay } from "../../services/contentRepository.js";
import { useSession } from "../../store/SessionContext.jsx";
import { useNavigation } from "../../store/NavigationContext.jsx";

/**
 * HERO-JA E KOMUNITETIT (seksioni 6.6).
 *
 * Tre elemente: avatar me unazë, përshëndetje sipas orës me emrin, dhe citati
 * i ditës. Zëvendëson titullin e mëparshëm "Komuniteti" — emri i skedës
 * shihet tashmë te shiriti i poshtëm, ndaj përsëritja e tij zinte hapësirën
 * e asaj që bën ndryshimin: përshëndetjen personale.
 *
 * ⚠️  E centruar me kërkesë të klientes (16 shtator 2026). Më parë ishte
 *     rresht horizontal — avatari majtas, teksti djathtas, citati me një vijë
 *     ari në të majtë. Vija e artë ra bashkë me rreshtimin: në një bllok të
 *     centruar ajo do të ishte e vetmja gjë e shtrembër.
 */
export function CommunityHero() {
  const { name } = useSession();
  const { goToProfile } = useNavigation();

  const part = dayPart();
  const { hi } = greetingFor(part);
  const quote = quoteOfDay(part);

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: `18px ${layout.gutter}px 18px`,
        /* Pa sfond: aurora e `AppShell` duhet të kalojë pas avatarit dhe
           përshëndetjes, siç e ka pamja e klientes. Një `T.bg` i bardhë këtu
           e priste tintin pikërisht nën shiritin e sipërm. */
        background: "transparent",
      }}
    >
      <AvatarRing onClick={goToProfile} />

      <h1
        style={{
          color: T.ink,
          fontSize: 23,
          fontWeight: 700,
          letterSpacing: -0.3,
          lineHeight: 1.2,
          margin: "14px 0 0",
          maxWidth: "100%",
          ...sx.truncate,
        }}
      >
        {hi}, {name}
      </h1>

      {/* Thonjëzat janë pjesë e pamjes, jo e tekstit: citatet te
          `contentRepository` ruhen pa to, që të mund të përdoren edhe gjetkë
          (njoftime, ekrani i përmbylljes) pa i hequr me dorë. */}
      <p
        style={{
          color: T.sub,
          fontSize: 13.5,
          fontStyle: "italic",
          lineHeight: 1.5,
          margin: "8px 0 0",
          maxWidth: 320,
        }}
      >
        “{quote}”
      </p>
    </header>
  );
}

/** Lejla e çelët e unazës — më e hapur se `T.accent`, që rrethi të mos rëndojë. */
const UNAZA = "#A78BE8";

/**
 * Avatari me unazë lejla.
 *
 * ⚠️  Tri hollësi që i kërkoi pamja e klientes dhe që duken vetëm bashkë:
 *     unaza më e hapur se vjollca e brand-it, një hapësirë mes unazës dhe
 *     figurës (padding-u, jo një ikonë më e madhe), dhe një shkëlqim i butë
 *     rreth e rrotull. Pa hapësirën, unaza duket sikur e shtrëngon figurën.
 */
function AvatarRing({ onClick }) {
  return (
    <button
      onClick={onClick}
      /* Jo thjesht "Profili": avatari te shiriti i sipërm e mban atë emër, dhe
         dy butona me emër identik njoftohen njësoj nga lexuesit e ekranit. */
      aria-label="Hap profilin"
      className="ag-press"
      style={{
        ...sx.bareButton,
        ...sx.center,
        width: 84,
        height: 84,
        borderRadius: "50%",
        background: T.bg,
        border: `3px solid ${UNAZA}`,
        padding: 7,
        boxShadow: `0 0 18px rgba(167,139,232,0.38), 0 6px 18px rgba(124,92,224,0.12)`,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          ...sx.center,
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: T.bg,
        }}
      >
        <User size={28} color={T.accent} />
      </span>
    </button>
  );
}
