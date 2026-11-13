import {
  Activity,
  Brain,
  Eye,
  Footprints,
  Hand,
  Headphones,
  Heart,
  HeartPulse,
  Moon,
  Music,
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
 *
 * `cover` — fotoja e pllakës, te `public/kopertina/`, me parashtesën
 * `praktika-` që të mos ngatërrohet me kopertinat e meditimeve. E ka vetëm
 * ajo praktikë për të cilën erdhi një foto (13 nëntor 2026); pa të, karta
 * vizaton peizazhin procedural si më parë — `CoverArt` bie vetë te arti kur
 * `image` mungon OSE kur skedari nuk gjendet (`onError`). Pra një emër i
 * shkruar gabim nuk lë kurrë kuti të zbrazët, por as nuk bërtet: po doli
 * peizazh aty ku pritej foto, provoje adresën te shfletuesi.
 *
 * ⚠️  FOTOJA DUHET EDHE TE SERVERI. `/kopertina/` te `public_html` është
 *     dosje e vërtetë; ndërtimi e kopjon `public/` brenda `dist/`, ndaj zip-i
 *     i faqes i merr me vete — por nëse ngarkohet vetëm `index.html` dhe
 *     `assets/`, fotot nuk shkojnë dhe pllakat kthehen te peizazhi.
 */
export const TECHNIQUES = [
  { id: "t_body",     label: "Meditime për Trupin",   icon: Activity,   intent: "energy", cover: "/kopertina/praktika-trupi.jpeg" },
  { id: "t_heart",    label: "Meditime për Zemrën",   icon: Heart,      intent: "heart", cover: "/kopertina/praktika-zemra.jpeg" },
  { id: "t_brain",    label: "Meditime për Trurin",   icon: Brain,      intent: "focus", cover: "/kopertina/praktika-truri.jpeg" },
  { id: "t_walk",     label: "Meditim në ecje",       icon: Footprints, intent: "calm", cover: "/kopertina/praktika-ecje.jpeg" },
  { id: "t_manifest", label: "Meditime manifestimi",  icon: Sparkles,   intent: "abundance", cover: "/kopertina/praktika-manifestimi.jpeg" },
  { id: "t_reprog",   label: "Meditime riprogramimi", icon: RefreshCw,  intent: "transform", cover: "/kopertina/praktika-riprogramimi.jpeg" },
  { id: "t_heal",     label: "Rigjenerim dhe shërim", icon: HeartPulse, intent: "heal", cover: "/kopertina/praktika-rigjenerim.jpeg" },
  { id: "t_breath",   label: "Frymëmarrje",           icon: Wind,       intent: "calm", cover: "/kopertina/praktika-frymemarrje.jpeg" },
  { id: "t_eft",      label: "EFT / Tapping",         icon: Hand,       intent: "stress", cover: "/kopertina/praktika-eft.jpeg" },
  { id: "t_somatic",  label: "Teknika Somatike",      icon: Waves,      intent: "heal", cover: "/kopertina/praktika-somatike.jpeg" },
  { id: "t_energy",   label: "Teknika Energjetike",   icon: Zap,        intent: "transform" },
  { id: "t_hypno",    label: "Hipnoterapi",           icon: Moon,       intent: "sleep" },
  { id: "t_visual",   label: "Vizualizim",            icon: Eye,        intent: "abundance", cover: "/kopertina/praktika-vizualizim.jpeg" },
  { id: "t_affirm",   label: "Afirmime",              icon: Quote,      intent: "selflove", cover: "/kopertina/praktika-afirmime.jpeg" },
  /*
   * Dy praktikat e fundit u shtuan më 8 tetor 2026 me kërkesë të klientes.
   *
   * `soon: true` — SHFAQEN EDHE KUR JANË BOSH.
   *
   * ⚠️  Është përjashtim i qëllimshëm nga rregulli. `listTechniques` i heq
   *     praktikat bosh, sepse një pllakë që hap një folder të zbrazët është më
   *     keq se asnjë pllakë; këto të dyja e kapërcejnë atë filtër me kërkesë
   *     të klientes (12 nëntor 2026), që të dukeshin para se të vijë audioja.
   *
   * ⚠️  FLAMURI HIQET SAPO TË VIJË PËRMBAJTJA. Me të parën këngë a pjesë
   *     muzikore, numëruesi bëhet > 0 dhe pllaka do të dilte vetvetiu — pra
   *     `soon` nuk duhet më, dhe po të mbetet aty nuk prish gjë, por fsheh
   *     faktin që praktika u mbush vërtet. Shih `mysql/19_praktika_te_reja.sql`.
   *
   * ⚠️  NUK PREK NDËRTUESIN E SEANCAVE. `BlockBuilder` e thërret
   *     `listTechniques()` pa argument, ndaj aty praktikat bosh mbeten të
   *     fshehura — një hap i ndërtuesit që nuk ka çfarë të japë është rrugë
   *     pa krye, jo premtim.
   */
  { id: "t_songs",    label: "Këngë motivuese",       icon: Music,      intent: "energy", soon: true, grid: true, cover: "/kopertina/praktika-kenge.jpeg" },
  { id: "t_music",    label: "Muzikë meditimi",       icon: Headphones, intent: "calm",   soon: true, grid: true, cover: "/kopertina/praktika-muzike.jpeg" },
];
