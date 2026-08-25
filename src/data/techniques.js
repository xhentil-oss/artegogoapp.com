import {
  Activity,
  Brain,
  Eye,
  Footprints,
  Hand,
  Heart,
  HeartPulse,
  Moon,
  Quote,
  RefreshCw,
  Sparkles,
  Waves,
  Wind,
  Zap,
} from "lucide-react";

/**
 * TEKNIKAT — përgjigjen "SI bëhet" meditimi.
 *
 * Njëra nga dy etiketat e klasifikimit të dyfishtë; tjetra është kategoria
 * ("PËR ÇFARË qëllimi"). Çdo meditim mban saktësisht një teknikë dhe një
 * kategori, dhe shfaqet në të dyja pamjet — pa u kopjuar.
 *
 * Rendi ndjek specifikimin (seksioni 4).
 * `intent` përcakton vetëm gradientin; nuk ka lidhje me klasifikimin.
 */
export const TECHNIQUES = [
  { id: "t_body",     label: "Meditime për Trupin",   icon: Activity,   intent: "energy" },
  { id: "t_heart",    label: "Meditime për Zemrën",   icon: Heart,      intent: "heart" },
  { id: "t_brain",    label: "Meditime për Trurin",   icon: Brain,      intent: "focus" },
  { id: "t_walk",     label: "Meditim në ecje",       icon: Footprints, intent: "calm" },
  { id: "t_manifest", label: "Meditime manifestimi",  icon: Sparkles,   intent: "abundance" },
  { id: "t_reprog",   label: "Meditime riprogramimi", icon: RefreshCw,  intent: "transform" },
  { id: "t_heal",     label: "Rigjenerim dhe shërim", icon: HeartPulse, intent: "heal" },
  { id: "t_breath",   label: "Frymëmarrje",           icon: Wind,       intent: "calm" },
  { id: "t_eft",      label: "EFT / Tapping",         icon: Hand,       intent: "stress" },
  { id: "t_somatic",  label: "Teknika Somatike",      icon: Waves,      intent: "heal" },
  { id: "t_energy",   label: "Teknika Energjetike",   icon: Zap,        intent: "transform" },
  { id: "t_hypno",    label: "Hipnoterapi",           icon: Moon,       intent: "sleep" },
  { id: "t_visual",   label: "Vizualizim",            icon: Eye,        intent: "abundance" },
  { id: "t_affirm",   label: "Afirmime",              icon: Quote,      intent: "selflove" },
];
