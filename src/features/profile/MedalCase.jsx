import { Flame, Medal } from "lucide-react";
import { T, medal as medalColors, radii, shadows } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { MEDAL_TIERS, nextMedal, totalMedals } from "../../domain/medals.js";
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
  const { streak, record, medals } = useProgress();

  const goal = nextMedal(streak);
  const earned = totalMedals(medals);

  return (
    <section style={{ ...sx.panel, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ color: T.ink, fontSize: 16, fontWeight: 800 }}>Medaljet</div>
          <div style={{ color: T.sub, fontSize: 13, marginTop: 2 }}>
            {/* «medalje» është femërore: 1 e fituar, por 3 të fituara */}
            {earned === 0 ? "Ende pa medalje" : earned === 1 ? "1 e fituar" : `${earned} të fituara`}
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

      <div style={{ display: "flex", gap: 10, margin: "20px 0 4px" }}>
        {MEDAL_TIERS.map((tier) => (
          <Tier key={tier.id} tier={tier} count={medals[tier.id] ?? 0} />
        ))}
      </div>

      <div
        style={{
          borderTop: `1px solid ${T.line}`,
          marginTop: 18,
          paddingTop: 14,
          color: T.sub,
          fontSize: 12.5,
          lineHeight: 1.55,
        }}
      >
        Edhe <strong style={{ color: T.ink }}>{goal.daysLeft}</strong> ditë meditim rresht deri te{" "}
        <strong style={{ color: TIER_COLORS[goal.tier.id].ink }}>{goal.tier.label}</strong> i radhës.
        {record > streak && (
          <>
            <br />
            Rekordi yt: {record} ditë rresht.
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Kontrolle demo — vetëm në modalitetin admin.
 *
 * Pa to, medalja e artë do të shihej vetëm pas 21 ditësh praktike të vërtetë;
 * klienti duhet ta shohë sistemin duke punuar sot.
 */
export function MedalDemoControls() {
  const { streak, medals, seedStreakDemo, clearHistoryDemo } = useProgress();

  return (
    <section style={{ ...sx.panel, borderRadius: radii.lg, padding: 16, marginBottom: 12 }}>
      <div style={{ color: T.ink, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
        Simulo ditët rresht (demo)
      </div>
      <div style={{ color: T.sub, fontSize: 12.5, marginBottom: 12 }}>
        Tani: <strong>{streak} ditë</strong> · {medals.bronze} bronz, {medals.silver} argjend,{" "}
        {medals.gold} ar
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[3, 7, 21, 45].map((days) => (
          <button
            key={days}
            onClick={() => seedStreakDemo(days)}
            className="ag-press"
            style={{
              background: T.bg,
              border: `1px solid ${T.line}`,
              borderRadius: radii.pill,
              padding: "9px 14px",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 600,
              color: T.ink,
            }}
          >
            {days} ditë
          </button>
        ))}
        <button
          onClick={clearHistoryDemo}
          className="ag-press"
          style={{
            background: T.ink,
            border: "none",
            borderRadius: radii.pill,
            padding: "9px 14px",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          Pastro
        </button>
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
        <div
          className={shines ? "ag-shine" : undefined}
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: owned ? colors.soft : T.bg2,
            border: `1.5px solid ${owned ? colors.ink : T.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            /* e pafituar rri e shuar, por e pranishme — synimi mbetet i dukshëm */
            opacity: owned ? 1 : 0.55,
          }}
        >
          <Medal size={30} color={owned ? colors.ink : T.faint} strokeWidth={1.8} />
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

      <div style={{ color: owned ? T.ink : T.sub, fontSize: 13.5, fontWeight: 700, marginTop: 9 }}>
        {tier.label}
      </div>
      <div style={{ color: T.faint, fontSize: 11.5, marginTop: 1 }}>
        {count} fituar
      </div>
      <div style={{ color: T.faint, fontSize: 10.5, marginTop: 3 }}>
        çdo {tier.everyDays} ditë
      </div>
    </div>
  );
}
