import { ArrowLeft } from "lucide-react";
import { T, radii } from "../../theme/tokens.js";
import { sx, circle, pill } from "../../theme/styles.js";

/** Buton i rrumbullakët me ikonë — mbi hero-t e errët. */
export function CircleIconButton({ onClick, children, size = 40, background = "rgba(0,0,0,0.3)", blur }) {
  return (
    <button
      onClick={onClick}
      className="ag-press"
      style={{
        ...circle(size, background),
        border: "none",
        cursor: "pointer",
        position: "relative",
        ...(blur ? { backdropFilter: "blur(4px)" } : null),
      }}
    >
      {children}
    </button>
  );
}

/** Butoni "prapa" standard mbi një hero. */
export function BackButton({ onClick, blur }) {
  return (
    <CircleIconButton onClick={onClick} blur={blur} background={blur ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.3)"}>
      <ArrowLeft size={20} color="#fff" />
    </CircleIconButton>
  );
}

/** Buton "pill" — filtra, skeda, zgjedhje. */
export function PillButton({ active, onClick, children, style }) {
  return (
    <button onClick={onClick} style={{ ...pill(active), ...style }}>
      {children}
    </button>
  );
}

/** Grup pill-a ekskluzivë. `options` = [{ id, label }]. */
export function PillGroup({ options, value, onChange, style }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, ...style }}>
      {options.map((option) => (
        <PillButton
          key={option.id}
          active={value === option.id}
          onClick={() => onChange(option.id)}
          style={{ padding: "6px 13px", fontSize: 12.5, fontWeight: 600, background: value === option.id ? T.ink : T.bg }}
        >
          {option.label}
        </PillButton>
      ))}
    </div>
  );
}

/** Ndërruesi i periudhës brenda trackerave (Javore / Mujore / Vjetore). */
export function SegmentedControl({ options, value, onChange, style }) {
  return (
    <div style={{ display: "flex", gap: 6, background: T.bg, borderRadius: radii.md, padding: 4, ...style }}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          style={{
            flex: 1,
            background: value === option.id ? T.ink : "transparent",
            color: value === option.id ? "#fff" : T.sub,
            border: "none",
            borderRadius: 9,
            padding: 8,
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Ndërprerës on/off. */
export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      /* Pa këto, çelësi njoftohet si buton bosh: teksti pranë tij është një
         element më vete dhe lexuesi i ekranit nuk i lidh dot vetë. */
      role="switch"
      aria-checked={checked}
      aria-label={label}
      style={{
        width: 46,
        height: 26,
        borderRadius: 14,
        border: "none",
        cursor: "pointer",
        background: checked ? T.ink : T.line,
        position: "relative",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          transition: "left .2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

/** Butoni kryesor i formës "pill", i mbushur. */
export function PrimaryButton({ onClick, children, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="ag-press"
      style={{
        background: T.ink,
        color: "#fff",
        border: "none",
        borderRadius: radii.pill,
        padding: "12px 22px",
        cursor: disabled ? "default" : "pointer",
        fontSize: 14,
        fontWeight: 700,
        opacity: disabled ? 0.4 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Buton pa kornizë, vetëm ikonë/tekst. */
export function BareButton({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{ ...sx.bareButton, display: "flex", ...style }}>
      {children}
    </button>
  );
}
