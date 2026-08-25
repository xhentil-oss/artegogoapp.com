import { Wind, Heart, Waves, Brain, Moon, Zap, Flame, Sparkles, Sun } from "lucide-react";

/**
 * QËLLIMET (intents) — boshti kryesor i taksonomisë.
 *
 * Çdo meditim, koleksion, program dhe postim i referohet një `id` të këtushme.
 * `g` është çifti i gradientit; `icon` përdoret në navigim dhe filtra.
 */
export const INTENTIONS = [
  { id: "calm",      label: "Qetësim",           icon: Wind,     g: ["#A8C0FF", "#5478C9"] },
  { id: "heart",     label: "Hapje Zemre",       icon: Heart,    g: ["#FF9EC4", "#C9457E"] },
  { id: "heal",      label: "Shërim Emocional",  icon: Waves,    g: ["#C9A8FF", "#7B4BC9"] },
  { id: "focus",     label: "Fokus",             icon: Brain,    g: ["#FFD58A", "#E08A3C"] },
  { id: "sleep",     label: "Gjumë",             icon: Moon,     g: ["#5C7BD9", "#1E2B6B"] },
  { id: "energy",    label: "Energji",           icon: Zap,      g: ["#FFB37A", "#E0552B"] },
  { id: "stress",    label: "Çlirim Stresi",     icon: Flame,    g: ["#FF8AA8", "#C9457E"] },
  { id: "transform", label: "Transformim",       icon: Sparkles, g: ["#9E7BFF", "#5A2BC9"] },
  { id: "abundance", label: "Bollëk",            icon: Sun,      g: ["#FFD98A", "#E0A93C"] },
  { id: "selflove",  label: "Dashuri për Veten", icon: Heart,    g: ["#FFA8C4", "#D9457E"] },
];

/**
 * Frekuenca bazë (Hz) e tonit që gjeneron player-i për çdo qëllim.
 * Zëvendësohet nga audio reale kur skedarët të vijnë nga backend-i.
 */
export const INTENT_FREQUENCY = {
  calm: 110,
  heart: 136.1,
  heal: 128,
  focus: 144,
  sleep: 96,
  energy: 162,
  stress: 120,
  transform: 174,
  abundance: 150,
  selflove: 140,
};
