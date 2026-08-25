import { PHASES } from "./blocks.js";

/**
 * KOLEKSIONET — kategoritë e mëdha që shfaqen si "foldera" në bibliotekë.
 *
 * Struktura: Koleksion → nën-grupe → meditime.
 * `mk` dhe `grp` janë fabrika që heqin përsëritjen; kur përmbajtja të vijë
 * nga backend-i, ky skedar bëhet vetëm një fallback offline.
 */

let sequence = 0;
const nextId = () => `c${1000 + ++sequence}`;

/** Krijon një meditim brenda një nën-grupi. */
const mk = (title, intent, dur, premium) => ({
  id: nextId(),
  title,
  intent,
  dur,
  premium,
  phase: PHASES.CORE,
  desc: `${title} — praktikë e udhëhequr nga Arte Gogo.`,
});

/** Krijon një nën-grup me titujt e dhënë. */
const grp = (name, intent, titles, premium = true, dur = 10) => ({
  name,
  items: titles.map((title) => mk(title, intent, dur, premium)),
});

export const COLLECTIONS = [
  {
    id: "col_med",
    label: "Meditime të Udhëhequra",
    intent: "heart",
    desc: "Emocione, zemra, vetëbesim, truri, gjumë, energji, manifestim",
    groups: [
      grp("Emocione", "stress", ["Liro ankthin në 10 minuta", "Dil nga paniku", "Qetëso zemërimin", "Shkrij trishtimin", "Largo fajin", "Largo turpin", "Kapërce zilinë", "Liro xhelozinë", "Çliro frikën", "Përballo pasigurinë", "Liro mërzinë", "Qetëso mendimet obsesive", "Rikthe shpresën", "Ndërprit mbingarkesën emocionale"], false),
      grp("Zemra", "heart", ["Hap zemrën", "Aktivizo dhembshurinë", "Fal veten", "Fal dikë", "Liro dhimbjen e tradhtisë", "Shëro ndarjen", "Rikthe besimin", "Ndje dashurinë pa kushte", "Meditim për marrëdhënien në çift"]),
      grp("Vetëbesimi", "energy", ["Para një interviste", "Para një prezantimi", "Para një fjalimi", "Para kamerës", "Para një takimi biznesi", "Para negociatave", "Rrit karizmën", "Aktivizo liderin", "Aktivizo autoritetin"]),
      grp("Truri", "focus", ["Fokus ekstrem", "Kujtesë më e mirë", "Studim intensiv", "Për provime", "Për moshën mbi 50 vjeç", "Kreativitet", "Vendimmarrje", "Intuitë", "Zgjidh probleme", "Mendo qartë"], false),
      grp("Gjumi", "sleep", ["Fli shpejt", "Gjumi i thellë", "Pas pagjumësisë", "Pas zgjimit natën", "Rikthe ritmin cirkadian", "Zgjohu me energji"], false),
      grp("Energjia", "energy", ["Energjia e mëngjesit", "Pasdite pa lodhje", "Pas punës", "Pas udhëtimit", "Pas stresit", "Rimbush energjinë", "Ndjehu i lehtë"]),
      grp("Manifestimi", "abundance", ["Manifesto bollëk", "Manifesto partner", "Manifesto shtëpi", "Manifesto punë", "Manifesto klientë", "Manifesto shëndet", "Manifesto sukses"]),
    ],
  },
  {
    id: "col_eft",
    label: "EFT (Tapping)",
    intent: "stress",
    desc: "Çlirim emocional përmes tapping-ut",
    groups: [
      grp("Ankthi", "stress", ["Ankth i përgjithshëm", "Ankth para fluturimit", "Ankth para provimit", "Ankth para prezantimit", "Ankth social", "Ankth në trafik", "Ankth para gjumit"], false),
      grp("Marrëdhënie", "heart", ["Pas debatit", "Para një bisede të vështirë", "Pas tradhtisë", "Xhelozia", "Frika nga refuzimi", "Frika nga braktisja"]),
      grp("Biznes", "energy", ["Frika nga shitja", "Frika nga refuzimi", "Frika nga çmimet e larta", "Frika nga suksesi", "Frika nga dështimi", "Sindroma e mashtruesit"]),
      grp("Trupi", "heal", ["Dhimbje koke", "Dhimbje qafe", "Dhimbje shpine", "Migrenë", "Tension muskulor"]),
      grp("Varësi", "transform", ["Dëshira për sheqer", "Dëshira për cigare", "Overeating", "Telefoni", "Rrjetet sociale"]),
    ],
  },
  {
    id: "col_breath",
    label: "Frymëmarrje",
    intent: "calm",
    desc: "Aktivizim, qetësim, performancë, shërim",
    groups: [
      grp("Aktivizim", "energy", ["Energji në mëngjes", "Aktivizo motivimin", "Para palestrës", "Para punës"], false),
      grp("Qetësim", "calm", ["Për panik", "Për ankth", "Për stres", "Pas debatit", "Në trafik"], false),
      grp("Performancë", "focus", ["Fokus", "Kreativitet", "Para provimit", "Para negociatës", "Para sportit"]),
      grp("Manifestim", "abundance", ["Manifesto bollëk", "Manifesto shtëpi", "Manifesto klientë", "Manifesto partner", "Manifesto shëndet"]),
      grp("Shërim", "heal", ["Frymëmarrje vagale", "Frymëmarrje diafragmatike", "Coherence breathing", "Box breathing", "Resonant breathing"], false),
    ],
  },
  {
    id: "col_somatic",
    label: "Praktika Somatike",
    intent: "heal",
    desc: "Lirim trupor dhe rregullim i sistemit nervor",
    groups: [
      grp("Lirim & Çlirim", "heal", ["Shkundja neurogjene", "Trauma release", "Somatic shaking", "Somatic orienting", "Pendulation", "Titration"]),
      grp("Tokëzim & Lëvizje", "calm", ["Grounding", "Body scan", "Somatic walking", "Somatic dancing"], false),
      grp("Lirim i zonave", "heal", ["Lirim i nofullës", "Lirim i legenit", "Lirim i diafragmës", "Lirim i kraharorit", "Hapja e qafës"]),
    ],
  },
  {
    id: "col_energy",
    label: "Praktika Energjitike",
    intent: "transform",
    desc: "Aura, chakrat, vibracioni dhe vetë-shërimi",
    groups: [
      grp("Aura & Mbrojtje", "transform", ["Mbush aurën", "Pastro aurën", "Mbrojtje energjitike", "Kthe energjinë tek vetja", "Liro lidhjet toksike"]),
      grp("Aktivizim", "heart", ["Hap zemrën", "Aktivizo intuitën", "Aktivizo bollëkun", "Balanco chakrat"]),
      grp("Vibracioni", "abundance", ["Tokëzim", "Qendra e trupit", "Rrit vibracionin", "Praktika me duar", "Vetë-shërim energjetik"]),
    ],
  },
  {
    id: "col_visual",
    label: "Vizualizime",
    intent: "abundance",
    desc: "Imagjino dhe ankoro realitetin e dëshiruar",
    groups: [
      grp("Vetja", "transform", ["Takimi me veten e ardhshme", "Versioni më i mirë i vetes", "Fëmija i brendshëm", "Takimi me mentorin"]),
      grp("Jeta ideale", "abundance", ["Dita perfekte", "Shtëpia ideale", "Biznesi ideal", "Partneri ideal", "Trupi ideal", "Skenari i suksesit"]),
    ],
  },
  {
    id: "col_affirm",
    label: "Afirmime",
    intent: "selflove",
    desc: "Riprogramim përmes fjalës pohuese",
    groups: [
      grp("Zhvillim personal", "selflove", ["Bollëk", "Vetëvlerësim", "Dashuri", "Shëndet", "Manifestim", "Falje", "Besim"], false),
      grp("Role", "energy", ["Prindërim", "Biznes", "Karrierë", "Gratë", "Burrat", "Fëmijët", "Studentët"]),
    ],
  },
  {
    id: "col_hypno",
    label: "Hipnoza",
    intent: "sleep",
    desc: "Riprogramim i thellë në gjendje hipnotike",
    groups: [
      grp("Transformim", "transform", ["Gjumi", "Humbje peshe", "Vetëbesim", "Ndal duhanin", "Manifestim", "Kujtesë", "Kreativitet", "Shërim emocional"]),
    ],
  },
  {
    id: "col_moment",
    label: "Për Çdo Moment",
    intent: "calm",
    desc: "Praktika të shkurtra për çdo pjesë të ditës",
    groups: [
      grp("Mëngjes", "energy", ["3 minuta energji", "Vendos qëllimin", "Aktivizo zemrën"], false, 3),
      grp("Në makinë", "focus", ["Në trafik", "Para punës", "Pas punës"], false, 5),
      grp("Në punë", "focus", ["Para mbledhjes", "Pas mbledhjes", "Kur je i stresuar", "Kur nuk ke fokus"], false, 5),
      grp("Në shtëpi", "calm", ["Pas debatit", "Para gjumit", "Para darkës", "Pas lajmit të keq"], false, 5),
    ],
  },
  {
    id: "col_emergency",
    label: "Emergjencë",
    intent: "stress",
    desc: "Ndihmë e shpejtë në momente krize",
    groups: [
      grp("Krizë akute", "stress", ["Sulm paniku", "Zemërim ekstrem", "Ankth akut", "Lajm i keq", "Humbje", "Frikë", "Krizë emocionale", "Të qara", "Overthinking"], false, 8),
    ],
  },
  {
    id: "col_health",
    label: "Shëndet",
    intent: "heal",
    desc: "Mbështetje për trupin dhe rikuperimin",
    groups: [
      grp("Dhimbje & Tension", "heal", ["Dhimbje koke", "Migrenë", "Tension", "Tinnitus"]),
      grp("Gjendje kronike", "heal", ["IBS", "Hashimoto", "Inflamacion", "Lodhje", "Mbështetje gjatë rikuperimit"]),
      grp("Cikli & Hormonet", "selflove", ["Menopauzë", "PMS"]),
    ],
  },
  {
    id: "col_rel",
    label: "Marrëdhënie",
    intent: "heart",
    desc: "Lidhje, komunikim dhe intimitet",
    groups: [
      grp("Lidhjet", "heart", ["Çifti", "Prindërimi", "Adoleshentët", "Intimiteti", "Miqësia"]),
      grp("Brenda vetes", "selflove", ["Kufijtë", "Komunikimi", "Falja", "Vetmia"]),
    ],
  },
  {
    id: "col_biz",
    label: "Biznesi",
    intent: "energy",
    desc: "Mendësi dhe performancë sipërmarrëse",
    groups: [
      grp("Mendësia", "energy", ["CEO Mindset", "Sipërmarrësi", "Lideri", "Vendimmarrja"]),
      grp("Aftësi", "focus", ["Shitjet", "Marketingu", "Kreativiteti", "Delegimi", "Produktiviteti", "Burnout"]),
    ],
  },
  {
    id: "col_kids",
    label: "Fëmijët",
    intent: "calm",
    desc: "Praktika të buta për fëmijë dhe familje",
    groups: [
      grp("Për fëmijë", "calm", ["Para gjumit", "Ankthi", "Vetëbesimi", "Përqendrimi", "Mirënjohja", "Menaxhimi i emocioneve"], false, 6),
      grp("Familje", "heart", ["Meditime familjare"], false, 8),
    ],
  },
  {
    id: "col_challenge",
    label: "Sfida të Drejtuara",
    intent: "transform",
    desc: "Rrugëtime shumë-ditore transformimi",
    groups: [
      grp("Sfidat", "transform", ["7 ditë kundër ankthit", "21 ditë vetëdashurie", "30 ditë bollëku", "30 ditë disipline", "7 ditë gjumë", "14 ditë zemra", "21 ditë meditimi", "40 ditë transformimi"]),
    ],
  },
];
