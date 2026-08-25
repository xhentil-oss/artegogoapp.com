import { Crown } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { useNavigation } from "../../store/NavigationContext.jsx";

/** Bllok i errët që shpjegon një veçori premium dhe çon te upsell-i. */
export function Paywall({ feature }) {
  const { openUpsell } = useNavigation();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1A1A2E, #2B1B4A)",
        borderRadius: 20,
        padding: 22,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Crown size={20} color={T.gold} />
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>Arte Gogo Premium</span>
      </div>

      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
        {feature}. Shkyç gjithçka me një abonim.
      </p>

      <button onClick={openUpsell} style={goldButton}>
        <Crown size={16} /> Bëhu Premium
      </button>
    </div>
  );
}

/** Stili i butonit të artë — i ndarë sepse përdoret edhe në upsell-in. */
export const goldButton = {
  background: "linear-gradient(135deg,#F0D49B,#E0A93C)",
  color: "#3A2410",
  border: "none",
  borderRadius: radii.pill,
  padding: 13,
  width: "100%",
  fontSize: 14.5,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};
