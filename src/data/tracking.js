/** Konfigurimi i trackerave të zakoneve, gjendjes emocionale dhe historikut. */

export const HABITS = [
  { id: "water",     label: "Ujë",         emoji: "💧" },
  { id: "walk",      label: "Ecje",        emoji: "🚶" },
  { id: "meditate",  label: "Meditim",     emoji: "🧘" },
  { id: "breathe",   label: "Frymëmarrje", emoji: "🌬️" },
  { id: "read",      label: "Lexim",       emoji: "📖" },
  { id: "gratitude", label: "Mirënjohje",  emoji: "🙏" },
];

/** Skala e gjendjes, 5 (shumë mirë) → 1 (keq). */
export const MOODS = [
  { v: 5, e: "😁", c: "#2BB673" },
  { v: 4, e: "🙂", c: "#7BC97B" },
  { v: 3, e: "😐", c: "#E6C26B" },
  { v: 2, e: "😔", c: "#E89B7B" },
  { v: 1, e: "😢", c: "#E0657E" },
];

/** Etiketat emocionale që zgjidhen pas një seance. */
export const SESSION_MOODS = [
  { emoji: "😌", label: "I qetë" },
  { emoji: "💗", label: "I hapur" },
  { emoji: "✨", label: "I freskët" },
  { emoji: "🌊", label: "I lehtësuar" },
  { emoji: "🔥", label: "Energjik" },
];

/** Periudhat e grafikëve. */
export const PERIODS = [
  { id: "week",  label: "Javore",  days: 7 },
  { id: "month", label: "Mujore",  days: 30 },
  { id: "year",  label: "Vjetore", months: 12 },
];

/** Historik demo — hiqet sapo progresi të ruhet në backend. */
export const SEED_HISTORY = [
  { date: "8 Qer",  min: 22, intent: "heart" },
  { date: "9 Qer",  min: 15, intent: "calm" },
  { date: "10 Qer", min: 30, intent: "transform" },
  { date: "11 Qer", min: 18, intent: "focus" },
  { date: "12 Qer", min: 25, intent: "heal" },
  { date: "13 Qer", min: 20, intent: "heart" },
];
