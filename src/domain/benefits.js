/**
 * "ÇFARË DO TË NDJESH" — dy rreshta për çdo qëllim.
 *
 * TANI ËSHTË REZERVË, JO BURIMI I PARË.
 *
 * Kolona `meditations.benefits` (shih `mysql/36_perfitimet.sql`) mban tekstin
 * e vetë meditimit, dhe `MeditationSheet` e përdor atë kur ekziston. Kjo hartë
 * vlen vetëm për meditimet që ende s'kanë tekst të tyrin — dhe ato janë shumica,
 * ndaj nuk fshihet.
 *
 * ⚠️  Dy rreshtat këtu janë të përbashkët për një qëllim të tërë: çdo meditim
 *     i "Gjumë" tregon të njëjtat. Sa herë klientja jep tekst për një meditim,
 *     ai del nga kjo hartë dhe hyn te databaza.
 */
const SIPAS_QELLIMIT = {
  calm:      ["Qetësim i sistemit nervor", "Frymëmarrje më e thellë e më e ngadaltë"],
  heart:     ["Hapje e butë e qendrës së zemrës", "Më shumë ngrohtësi ndaj vetes"],
  heal:      ["Çlirim emocional i butë", "Integrim i pjesëve të brendshme"],
  focus:     ["Mendje më e kthjellët", "Vëmendje që qëndron te një gjë e vetme"],
  sleep:     ["Trup i rënduar e i çlodhur", "Kalim i qetë drejt gjumit"],
  energy:    ["Energji e ngrohtë në trup", "Nisje e ditës me qartësi"],
  stress:    ["Lirim i tensionit të mbledhur", "Hapësirë mes teje dhe ankthit"],
  transform: ["Besime të vjetra që lëshojnë", "Një drejtim i ri që ndihet i mundshëm"],
  abundance: ["Ndjesi bollëku dhe mirënjohjeje", "Hapje ndaj asaj që po vjen"],
  selflove:  ["Butësi ndaj vetes", "Pranim pa kushte"],
};

const REZERVA = ["Qetësi më e thellë", "Kthim te vetja"];

/** Dy përfitimet e një meditimi. Kthen gjithmonë një listë të vlefshme. */
export const benefitsFor = (intent) => SIPAS_QELLIMIT[intent] ?? REZERVA;
