/**
 * "ÇFARË DO TË NDJESH" — dy rreshta për çdo qëllim.
 *
 * ⚠️  TEKST I PËRKOHSHËM. Databaza nuk mban asnjë fushë për përfitimet e një
 *     meditimi, ndaj këto rrjedhin nga qëllimi, jo nga vetë meditimi: të gjitha
 *     meditimet e "Gjumë" tregojnë të njëjtat dy rreshta. Kur klientja të japë
 *     tekstin e vet për secilin, shtohet një kolonë te `meditations` dhe kjo
 *     hartë bëhet rezervë për ato që mbeten pa të.
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
