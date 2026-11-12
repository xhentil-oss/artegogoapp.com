import { DAY_PARTS } from "../lib/time.js";

/**
 * Përshëndetjet, etiketat dhe afirmimi i ditës.
 * Faqja "Sot" dhe hero-ja e Komunitetit zgjedhin bllokun sipas `dayPart()`.
 *
 * ⚠️  HISTORIKU I ZGJEDHJES, që shpjegon pse `quoteOfDay` punon me ditën e
 *     vitit dhe jo me diçka më të thjeshtë:
 *
 *       • Në fillim ishin tri thënie për çdo pjesë dite, të zgjedhura me
 *         `date.getDate() % 3` — pra e njëjta rikthehej çdo ditë të tretë.
 *       • Më 18 shtator 2026 u rritën në tridhjetë për pjesë (120 gjithsej)
 *         dhe zgjedhja kaloi te dita e vitit: një muaj pa përsëritje.
 *       • Më 12 nëntor 2026 të 120-at u zëvendësuan nga njëqind afirmimet e
 *         klientes, të përbashkëta për të katër pjesët e ditës.
 *
 *     Zgjedhja me ditën e vitit mbeti e njëjta në të tria hapat; ndryshoi
 *     vetëm se çfarë ka brenda lista dhe sa e gjatë është.
 */
/**
 * AFIRMIMET — njëqind, një për çdo ditë.
 *
 * Teksti është i klientes, i dërguar më 12 nëntor 2026, i marrë fjalë për
 * fjalë. Grupimet me komente janë po të sajat; shërbejnë vetëm për lexim —
 * aplikacioni e trajton vargun si një listë të vetme.
 *
 * ⚠️  ZËVENDËSOJNË 120 CITATET E MËPARSHME, që ishin katër pishina prej
 *     tridhjetësh — një për mëngjesin, drekën, mbrëmjen dhe natën. Ato ishin
 *     vëzhgime në vetën e dytë ("Zgjohu ngadalë"); këto janë pohime në vetën
 *     e parë ("Unë rritem çdo ditë"), ndaj nuk ndahen dot sipas orës pa i
 *     prishur. Lista e vjetër rri e plotë te historiku i Git-it.
 *
 * ⚠️  TË KATËR PJESËT E DITËS TREGOJNË TË NJËJTIN AFIRMIM. Më parë shfaqeshin
 *     katër thënie brenda ditës, një për çdo pjesë. Tani është një e vetme,
 *     nga mëngjesi deri natën, dhe ndryshon vetëm me ditën — ashtu siç u
 *     kërkua: "çdo ditë nga një thënie".
 *
 * ⚠️  NUK I PREK ETIKETAT. `hi`, `label`, `sub` dhe `intent` mbeten të ndara
 *     sipas orës: përshëndetja te hero-ja dhe rituali te faqja "Sot" vazhdojnë
 *     të ndryshojnë gjatë ditës. Vetëm teksti i afirmimit është i përbashkët.
 *
 * ⚠️  NJËQIND, JO NJË NUMËR TJETËR. `quoteOfDay` zgjedh me
 *     `dita e vitit % gjatësia e listës`. Me 100, i njëjti afirmim rikthehet
 *     një herë në njëqind ditë. Shtimi ose heqja e një rreshti e zhvendos
 *     gjithë rrotullimin — gjë e padëmshme, por e dukshme nëse pret të njëjtin
 *     afirmim nesër.
 *
 * ⚠️  THONJËZAT NUK JANË KËTU. I vendos pamja (`CommunityHero`), që teksti të
 *     mbetet i përdorshëm edhe te njoftimet.
 */
export const AFIRMIME = [
  /* Fillime dhe rritje — 1–12 */
  "Unë jam i hapur ndaj fillimeve të reja.",
  "Unë jam mrekullia në jetën time.",
  "Dyert e mirësisë hapen për mua.",
  "Çdo ditë mësoj më shumë për veten time.",
  "Unë rritem çdo ditë.",
  "Çdo ditë bëhem më mirë e më mirë.",
  "Tani jam gati për hapin e radhës.",
  "Jam gati për aventurën e jetës sime.",
  "Unë jam artisti i jetës sime.",
  "E pikturoj të ardhmen time me ngjyrat e ëndrrave të mia.",
  "Unë jam krijuesi i jetës sime.",
  "Unë zhvillohem çdo ditë drejt vetes sime më të lartë.",

  /* Dashuri dhe pranim i vetes — 13–30 */
  "Jam i denjë për t’u dashur dhe pranuar.",
  "Unë zgjedh t’i jap vetes dashuri çdo ditë.",
  "E vlerësoj veten ashtu siç jam.",
  "Çdo karakteristikë e imja më bën unik.",
  "E pranoj veten me gjithë kufizimet e mia.",
  "E dua veten me gjithë imperfeksionet e mia.",
  "E mbështes veten edhe në momentet e vështira.",
  "Në pranimin e vetes rizbuloj forcën time.",
  "Unë e përqafoj veten time të plotë.",
  "Çdo pjesë e imja është e bukur.",
  "Unë jam dhurata e kësaj bote.",
  "E njoh dhe e pranoj vlerën time.",
  "Unë e fal veten.",
  "E liroj veten nga presioni për të qenë i përsosur.",
  "Çdo përpjekje e imja sjell rritje.",
  "Jam krenar me veten për gjithçka që kam bërë.",
  "E vlerësoj veten për çdo ndryshim që kam arritur.",
  "Në zemrën time ka mirësi, dhembshuri dhe mençuri.",

  /* Ndjenjat, nevojat dhe kufijtë — 31–40 */
  "E vërteta ime ka rëndësi.",
  "Ndjenjat e mia kanë vlerë.",
  "Nuk ka ndjenja të gabuara.",
  "E lejoj veten të ndiej me pranim dhe dashuri.",
  "Unë i jap vlerë çdo përvoje që kam.",
  "Nevojat e mia kanë rëndësi.",
  "Është në rregull të kërkoj atë që më nevojitet.",
  "Unë kujdesem për veten me dashuri.",
  "Kam të drejtë të them “jo” për atë që nuk më shërben.",
  "Ndihem i lirë kur nuk reagoj ndaj rrethanave.",

  /* Siguri, paqe dhe besim — 41–58 */
  "Unë jam i sigurt dhe i mbrojtur.",
  "Unë lëshoj nevojën për t’u mbrojtur.",
  "Ka paqe për mua.",
  "Lëshoj nevojën për kontroll.",
  "Çdo gjë është ashtu si duhet të jetë.",
  "Çdo gjë në Univers është pro meje.",
  "Çdo gjë ndodh për mua dhe në favorin tim.",
  "Një dashuri pa kushte më shoqëron në çdo hap.",
  "Jam në harmoni të përsosur me krijimin.",
  "Unë lëshoj çdo situatë në duart e Dashurisë pa Kushte.",
  "Gjithçka zhvillohet sipas planit të përsosur të Burimit.",
  "Çdo pengesë në rrugën time shpërbëhet tani.",
  "Rruga ime është e hapur.",
  "Çdo sfidë është një mundësi për t’u rritur.",
  "Çdo vonesë ndodh për të mirën time më të lartë.",
  "Gabimet më mësojnë dhe më ngrenë në një nivel të ri.",
  "Çdo person është një mësues për mua.",
  "Çdo takim është i shenjtë.",

  /* Intuitë dhe qartësi — 59–68 */
  "Unë besoj te vetja dhe te urtësia ime e brendshme.",
  "Intuita ime gjithmonë më udhëheq.",
  "Jam një kanal frymëzimesh dhe idesh.",
  "Zemra ime më dhuron çdo ide që më nevojitet.",
  "Unë tani po shoh qartë.",
  "Marr vendime të drejta me qartësi dhe siguri.",
  "Jam gjithmonë në rrugën e duhur, në kohën e duhur.",
  "Të gjitha dyert e mundësive janë të hapura për mua.",
  "Aty ku të tjerët shohin rezistencë, unë shoh potencial.",
  "Fjalët e mia shërojnë, bekojnë dhe frymëzojnë.",

  /* Bollëk — 69–80 */
  "Unë jam magnet për bollëkun dhe dashurinë.",
  "Ligji i jetës është bollëku.",
  "Burimet e mia janë të pafundme.",
  "Të gjitha të mirat rrjedhin drejt meje.",
  "Çdo gjë që më nevojitet vjen tek unë.",
  "Paratë dhe pasuria vijnë tek unë lirshëm.",
  "Fuqia e krijimit banon te unë.",
  "Thesari i pasurive të pafundme është brenda meje.",
  "Jeta i plotëson të gjitha nevojat e mia tani.",
  "Kam lindur me gjithçka që më nevojitet.",
  "Kam lindur për t’u ngritur mbi çdo pengesë.",
  "Jam një me pafundësinë, prandaj ka vetëm sukses.",

  /* Trupi dhe shëndeti — 81–90 */
  "Trupi im është i fuqishëm.",
  "Ka shëndet, energji dhe vitalitet në trupin tim.",
  "Trupi im po bëhet çdo ditë më i shëndetshëm.",
  "Unë e respektoj dhe e dua trupin tim.",
  "E ushqej mirë trupin tim dhe e lë të pushojë.",
  "Unë jam i sigurt dhe në paqe në trupin tim.",
  "Çdo qelizë e trupit tim rigjenerohet çdo ditë.",
  "Çdo qelizë në trupin tim vallëzon në ritmin e shëndetit.",
  "Valë dashurie dhe shërimi rrjedhin në trupin tim.",
  "Uji që pi i pastron qelizat e mia.",

  /* Dashuri, falënderim dhe mrekulli — 91–100 */
  "Unë rrezatoj dashuri, paqe dhe gëzim.",
  "Ka harmoni dhe mirëkuptim në familjen time.",
  "E dua jetën dhe jeta ma kthen këtë dashuri.",
  "Jeta është një dhuratë për mua.",
  "Mrekullitë ndodhin në jetën time çdo ditë.",
  "Diçka e mrekullueshme po më ndodh pikërisht tani.",
  "Surpriza të lumtura më vijnë çdo ditë.",
  "Falenderimi në zemrën time tërheq mrekulli.",
  "Çdo ditë kam më shumë arsye për të falenderuar.",
  "Faleminderit për të gjitha të mirat në jetën time.",
];

export const GREETINGS = {
  [DAY_PARTS.MORNING]: {
    hi: "Mirëmëngjes",
    label: "RITUALI I MËNGJESIT",
    sub: "Nis ditën me qartësi dhe qëllim",
    intent: "energy",
    quotes: AFIRMIME,
  },
  [DAY_PARTS.AFTERNOON]: {
    hi: "Mirëdita",
    label: "PAUZË KOHERENCE",
    sub: "Një moment qetësie në mes të ditës",
    intent: "focus",
    quotes: AFIRMIME,
  },
  [DAY_PARTS.EVENING]: {
    hi: "Mirëmbrëma",
    label: "ÇLODHJE E MBRËMJES",
    sub: "Lëre ditën dhe kthehu te vetja",
    intent: "calm",
    quotes: AFIRMIME,
  },
  [DAY_PARTS.NIGHT]: {
    hi: "Natën e mirë",
    label: "SHTEGU I GJUMIT",
    sub: "Përgatitu për pushim të thellë",
    intent: "sleep",
    quotes: AFIRMIME,
  },
};

/** Hapat e ritmit ditor — shkyçen sipas orës. */
export const DAILY_RHYTHM_STEPS = [
  { id: "morning", title: "Meditimi i mëngjesit", sub: "Nis ditën me energji",            icon: "sunrise", fromHour: 5,  intent: "energy" },
  { id: "midday",  title: "Meditimi i drekës",    sub: "Rikthe koherencën",               icon: "sun",     fromHour: 12, intent: "calm" },
  { id: "evening", title: "Meditimi i darkës",    sub: "Çlirohu, reflekto dhe rikrijo",   icon: "moon",    fromHour: 19, intent: "sleep" },
];
