import { Flame, Lock, Medal } from "lucide-react";
import { T, medal as medalColors, radii, shadows } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { MEDAL_TIERS, totalMedals } from "../../domain/medals.js";
import { useProgress } from "../../store/ProgressContext.jsx";

/** Ngjyrat e secilës renditje — çelësat përputhen me `MEDAL_TIERS[].id`. */
const TIER_COLORS = {
  bronze: { ink: medalColors.bronze, soft: medalColors.bronzeSoft },
  silver: { ink: medalColors.silver, soft: medalColors.silverSoft },
  gold: { ink: medalColors.gold, soft: medalColors.goldSoft },
};

/**
 * Vitrina e medaljeve — seksioni 7 i katalogut.
 *
 * Të tria medaljet janë të njëjtës madhësi dhe rrinë gjithmonë në pamje, edhe
 * pa u fituar: një medalje e zbehtë tregon ku shkohet, ndërsa fshehja e saj do
 * ta linte përdoruesin pa e ditur fare se ekziston.
 */
export function MedalCase() {
  const { streak, medals } = useProgress();

  const earned = totalMedals(medals);

  return (
    <section style={{ ...sx.panel, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ color: T.ink, fontSize: 16, fontWeight: 800 }}>Medaljet e tua</div>
          <div style={{ color: T.sub, fontSize: 13, marginTop: 2 }}>
            {/* «medalje» është femërore: 1 e fituar, por 3 të fituara */}
            {earned === 0
              ? "Medito ditë pas dite për t'i shkyçur"
              : earned === 1
                ? "1 e fituar"
                : `${earned} të fituara`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: T.bg2,
            border: `1px solid ${T.line}`,
            borderRadius: radii.pill,
            padding: "7px 13px",
            flexShrink: 0,
          }}
        >
          <Flame size={15} color={streak > 0 ? T.gold : T.faint} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: streak > 0 ? T.ink : T.faint }}>
            {streak} ditë rresht
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, margin: "20px 0 2px" }}>
        {MEDAL_TIERS.map((tier) => (
          <Tier key={tier.id} tier={tier} count={medals[tier.id] ?? 0} />
        ))}
      </div>
    </section>
  );
}

function Tier({ tier, count }) {
  const colors = TIER_COLORS[tier.id];
  const owned = count > 0;
  /* vetëm ari shkëlqen — dhe vetëm kur është fituar vërtet */
  const shines = owned && tier.id === "gold";

  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div className={shines ? "ag-shine" : undefined} style={{ position: "relative", width: 62, height: 80 }}>
          {/*
            Medalja vizatohet si SVG, jo si rreth CSS: fjongot poshtë diskut
            nuk bëhen dot me `border-radius`, dhe pikërisht ato e bëjnë formën
            të lexohet si medalje e jo si buton.
          */}
          <svg width="62" height="80" viewBox="0 0 62 80" fill="none" aria-hidden="true">
            {/* Dy fjongot, të ngushta dhe të hapura pak, me prerje V në fund.
                Gri pak më e errët se disku: e bardha i nxirrte jashtë familjes,
                ndërsa një gri sa e sfondit nuk dallohej fare. */}
            <path
              d="M26 28h10v44l-5-5-5 5z"
              fill={owned ? colors.ink : "#E6E6EE"}
              stroke={owned ? colors.ink : "#DCDCE6"}
              strokeWidth="1.5"
              strokeLinejoin="round"
              transform="rotate(-15 31 32)"
            />
            <path
              d="M26 28h10v44l-5-5-5 5z"
              fill={owned ? colors.ink : "#E6E6EE"}
              stroke={owned ? colors.ink : "#DCDCE6"}
              strokeWidth="1.5"
              strokeLinejoin="round"
              transform="rotate(15 31 32)"
            />
            {/* Disku vizatohet i fundit, që të mbulojë krerët e fjongove.
                Kufiri është vijë e plotë, pak më e errët se mbushja — pa të,
                disku shkrihej me sfondin e kartës dhe forma humbiste. */}
            <circle
              cx="31"
              cy="31"
              r="30"
              fill={owned ? colors.soft : T.bgSkeleton}
              stroke={owned ? colors.ink : "#E2E2EA"}
              strokeWidth="2"
            />
          </svg>

          {/* Kyçi thotë "ende e mbyllur"; medalja shfaqet vetëm kur fitohet. */}
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 62,
              height: 62,
              ...sx.center,
            }}
          >
            {owned ? (
              <Medal size={30} color={colors.ink} strokeWidth={1.8} />
            ) : (
              <Lock size={26} color={T.faint} strokeWidth={1.8} />
            )}
          </span>
        </div>

        {owned && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: -4,
              top: -4,
              background: T.info,
              color: "#fff",
              borderRadius: radii.pill,
              minWidth: 24,
              height: 22,
              padding: "0 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11.5,
              fontWeight: 800,
              border: "2px solid #fff",
              boxShadow: shadows.soft,
            }}
          >
            ×{count}
          </span>
        )}
      </div>

      <div style={{ color: owned ? T.ink : T.sub, fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>
        {tier.label}
      </div>
      {/* Një rresht i vetëm nën emrin: sa ditë rresht duhen. "0 fituar" dhe
          "çdo N ditë" thoshin të njëjtën gjë dy herë. */}
      <div style={{ color: T.faint, fontSize: 11.5, marginTop: 2 }}>
        {tier.everyDays} ditë rresht
      </div>
    </div>
  );
}
