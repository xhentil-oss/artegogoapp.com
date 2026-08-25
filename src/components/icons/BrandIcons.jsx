/**
 * Ikonat e vetë-shkruara të brand-it Arte Gogo.
 * Çdo gjë tjetër vjen nga `lucide-react`.
 */

/** Gjethja e thjeshtë — shenja e vogël e brand-it. */
export function Leaf({ size = 16, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 21c0-5 1-9 8-12-1 6-3 9-8 12z" fill={color} />
      <path d="M12 21c0-5-1-9-8-12 1 6 3 9 8 12z" fill={color} opacity="0.6" />
    </svg>
  );
}

/** Gjethja e dyfishtë — ikona e skedës "Meditime". */
export function DoubleLeaf({ size = 24, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 22 C12 15 10 9 3 6 C4.5 13 7.5 17 12 22 Z" fill={color} />
      <path d="M12 22 C12 15 14 9 21 6 C19.5 13 16.5 17 12 22 Z" fill={color} opacity="0.55" />
    </svg>
  );
}

/** Figurë në pozë lotusi brenda hexagon-it — butoni "Krijo". */
export function LotusMark({ size = 28, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* kontur hexagonal */}
      <path d="M24 5 L38.7 13.5 V30.5 L24 39 L9.3 30.5 V13.5 Z" stroke={color} strokeWidth="2.4" strokeLinejoin="round" fill="none" />
      {/* koka */}
      <circle cx="24" cy="14.5" r="3.4" fill={color} />
      {/* krahët e ngritur në harqe simetrike */}
      <path d="M24 17.8 C20.5 18.2 17.5 21 17.5 24.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M24 17.8 C27.5 18.2 30.5 21 30.5 24.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* vorbulla qendrore në formë ∞ */}
      <path d="M24 22.5 C20.5 22.5 18.5 25 20 27.5 C21.2 29.5 24 28.8 24 26.5 C24 28.8 26.8 29.5 28 27.5 C29.5 25 27.5 22.5 24 22.5 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      {/* bishti i vorbullës */}
      <path d="M24 28.5 C24 31 22.5 32.5 20.5 32.8" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* këmbët e kryqëzuara */}
      <path d="M16.5 32.5 C19.5 34.3 28.5 34.3 31.5 32.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Lindja e diellit — hapi i mëngjesit në ritmin ditor. */
export function SunriseMark({ size = 30, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="4" fill={color} />
      <line x1="12" y1="4" x2="12" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5" y1="8" x2="6.5" y2="9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="19" y1="8" x2="17.5" y2="9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="21" x2="18" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
