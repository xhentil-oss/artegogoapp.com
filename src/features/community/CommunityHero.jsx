import { User } from "lucide-react";
import { T, fonts, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { brandPair } from "../../theme/gradients.js";
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
        alignItems: "center",
        gap: 15,
        padding: `18px ${layout.gutter}px 14px`,
        background: T.bg,
      }}
    >
      <AvatarRing onClick={goToProfile} />

      <div style={sx.flexText}>
        <div style={{ color: T.sub, fontSize: 13.5 }}>{hi},</div>
        <div
          style={{
            color: T.ink,
            fontFamily: fonts.display,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: -0.3,
            lineHeight: 1.15,
            marginTop: 1,
            ...sx.truncate,
          }}
        >
          {name}
        </div>

        <p
          style={{
            color: T.sub,
            fontSize: 12.5,
            fontStyle: "italic",
            lineHeight: 1.45,
            margin: "7px 0 0",
            paddingLeft: 9,
            borderLeft: `2px solid ${T.gold}`,
          }}
        >
          {quote}
        </p>
      </div>
    </header>
  );
}

/**
 * Avatari me unazë gradienti.
 *
 * Unaza vizatohet si sfond i një kutie pak më të madhe, me një hapësirë të
 * bardhë brenda — kështu nuk duhet as `border-image` as SVG, dhe rrethi
 * mbetet i saktë në çdo përmasë.
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
        width: 62,
        height: 62,
        borderRadius: "50%",
        padding: 2.5,
        background: `linear-gradient(140deg, ${brandPair[0]}, ${brandPair[1]})`,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: T.bg,
          /* boshllëku mes unazës dhe fytyrës — pa të, unaza duket si kufi */
          border: `2.5px solid ${T.bg}`,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: T.bg2,
          }}
        >
          <User size={25} color={T.faint} />
        </span>
      </span>
    </button>
  );
}
