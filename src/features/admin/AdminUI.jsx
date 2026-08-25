import { T, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";

/**
 * Elementet e përbashkëta të panelit të admin-it.
 *
 * Të gjashtë tabet përdorin të njëjtat fusha dhe butona; pa këtë skedar,
 * secili do t'i rishkruante stilet e veta dhe paneli do të dilte i shkallëzuar.
 */

export function Field({ label, hint, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", color: T.ink, fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
        {label}
        {hint && <span style={{ color: T.faint, fontWeight: 500 }}> · {hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Stili i përbashkët i fushave. 16px që iOS të mos zmadhojë faqen. */
export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: T.bg,
  border: `1px solid ${T.line}`,
  borderRadius: radii.md,
  padding: "11px 13px",
  color: T.ink,
  fontSize: 16,
  fontFamily: "inherit",
  outline: "none",
};

export function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{ ...inputStyle, minHeight: 96, resize: "vertical", lineHeight: 1.55, ...props.style }}
    />
  );
}

export function Select({ value, onChange, options, placeholder, ...rest }) {
  return (
    <select value={value ?? ""} onChange={onChange} {...rest} style={{ ...inputStyle, cursor: "pointer" }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function PrimaryButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      className="ag-press"
      style={{
        background: rest.disabled ? T.line : T.ink,
        color: rest.disabled ? T.faint : "#fff",
        border: "none",
        borderRadius: radii.md,
        padding: "12px 16px",
        cursor: rest.disabled ? "not-allowed" : "pointer",
        fontSize: 13.5,
        fontWeight: 700,
        ...sx.center,
        gap: 7,
        ...rest.style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      className="ag-press"
      style={{
        background: T.bg,
        color: T.ink,
        border: `1px solid ${T.line}`,
        borderRadius: radii.md,
        padding: "10px 14px",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        ...sx.center,
        gap: 6,
        ...rest.style,
      }}
    >
      {children}
    </button>
  );
}

/** Kartelë me titull dhe shpjegim të shkurtër — koka e çdo tabi. */
export function Panel({ title, note, children, action }) {
  return (
    <section style={{ ...sx.panel, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={sx.flexText}>
          <div style={{ color: T.ink, fontSize: 15, fontWeight: 800 }}>{title}</div>
          {note && (
            <div style={{ color: T.sub, fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{note}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Rresht liste me veprim në të djathtë. */
export function Row({ children, onRemove, removeLabel }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: T.bg,
        border: `1px solid ${T.line}`,
        borderRadius: radii.md,
        marginBottom: 8,
      }}
    >
      <div style={sx.flexText}>{children}</div>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={removeLabel}
          className="ag-press"
          style={{ ...sx.bareButton, color: T.faint, fontSize: 12, padding: 6, cursor: "pointer" }}
        >
          Fshi
        </button>
      )}
    </div>
  );
}

/** Mesazh kur një listë është bosh. */
export const Empty = ({ children }) => (
  <div style={{ color: T.faint, fontSize: 12.5, textAlign: "center", padding: "14px 0" }}>
    {children}
  </div>
);
