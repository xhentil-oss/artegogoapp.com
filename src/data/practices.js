import { Eye, Hand, Moon, Quote, Sparkles, Waves, Wind, Zap } from "lucide-react";

/**
 * EKSPLORO PRAKTIKAT — hyrje e shpejtë sipas *llojit* të praktikës.
 *
 * Nga 15 kategoritë e bibliotekës, tetë janë modalitete — përgjigjen "SI e
 * bën" (meditim, frymëmarrje, tapping…). Shtatë të tjerat janë situacionale —
 * "KUR e bën" (Emergjencë, Për Çdo Moment, Shëndet, Marrëdhënie, Biznesi,
 * Fëmijët, Sfida) dhe mbeten në grid-in e kategorive.
 *
 * `collectionId` lidh praktikën me koleksionin në `data/collections.js`;
 * numri i meditimeve nuk shkruhet këtu — llogaritet nga koleksioni, ndaj
 * nuk dilet jashtë sinkronit.
 *
 * Rendi ndjek katalogun.
 */
export const PRACTICES = [
  { id: "meditation", label: "Meditim",     collectionId: "col_med",     icon: Sparkles },
  { id: "breath",     label: "Frymëmarrje", collectionId: "col_breath",  icon: Wind },
  { id: "eft",        label: "EFT Tapping", collectionId: "col_eft",     icon: Hand },
  { id: "somatic",    label: "Somatike",    collectionId: "col_somatic", icon: Waves },
  { id: "energetic",  label: "Energjitike", collectionId: "col_energy",  icon: Zap },
  { id: "hypnosis",   label: "Hipnoterapi", collectionId: "col_hypno",   icon: Moon },
  { id: "visual",     label: "Vizualizim",  collectionId: "col_visual",  icon: Eye },
  { id: "affirm",     label: "Afirmime",    collectionId: "col_affirm",  icon: Quote },
];
