/**
 * TINGUJT E NDËRFAQES — të gjeneruar, jo skedarë.
 *
 * Një "ting" i shkurtër bëhet me dy oshilatorë; një MP3 do të ishte një kërkesë
 * rrjeti më shumë, një skedar për të mbajtur, dhe një vonesë e parë që dëgjohet
 * pikërisht atëherë kur duhet të mos dëgjohet.
 *
 * ⚠️  Konteksti krijohet një herë dhe ripërdoret. Një `AudioContext` i ri për
 *     çdo klikim i mbaron kuotat e shfletuesit (Chrome lejon një numër të
 *     kufizuar) dhe pas disa dhjetërash klikimesh tingulli do të pushonte.
 *
 * ⚠️  Krijohet vetëm brenda një klikimi. iOS dhe Safari e nisin kontekstin
 *     "suspended" derisa të ketë një prekje të vërtetë; thirrja nga një efekt
 *     do të linte një kontekst të ngrirë përgjithmonë.
 */
let konteksti = null;

const merrKontekstin = () => {
  if (konteksti) return konteksti;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return null;
  konteksti = new Ctor();
  return konteksti;
};

/**
 * Një notë e vetme sinusoidale me zbutje eksponenciale.
 *
 * `exponentialRampToValueAtTime` nuk pranon zero, ndaj niset e mbaron te
 * 0.0001: një vlerë praktikisht e heshtur, por e ligjshme.
 */
function noteAt(ac, dalja, frekuenca, fillimi, gjatesia, forca) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frekuenca, fillimi);

  gain.gain.setValueAtTime(0.0001, fillimi);
  gain.gain.exponentialRampToValueAtTime(forca, fillimi + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, fillimi + gjatesia);

  osc.connect(gain);
  gain.connect(dalja);
  osc.start(fillimi);
  osc.stop(fillimi + gjatesia + 0.02);
}

/**
 * "Ting" i shkurtër kur diçka shtohet — dy nota që ngjiten (La5 → Mi6).
 *
 * Intervali i kuintës tingëllon i plotësuar, jo alarmues; e njëjta arsye pse
 * lojërat e përdorin kur diçka mbyllet me sukses.
 */
export function tingulliShtimit() {
  try {
    const ac = merrKontekstin();
    if (!ac) return;
    /* Pas një pauze të gjatë konteksti fle; pa këtë tingulli humbet në heshtje. */
    if (ac.state === "suspended") ac.resume();

    const master = ac.createGain();
    master.gain.value = 0.16;
    master.connect(ac.destination);

    const t = ac.currentTime;
    noteAt(ac, master, 880, t, 0.18, 0.9);
    noteAt(ac, master, 1318.51, t + 0.065, 0.24, 0.7);
  } catch {
    /* Tingulli është shtesë: nëse shfletuesi e ndalon, ndërfaqja vazhdon. */
  }
}

/**
 * "Shkyçje" — kur mbyllet një ndalesë e rrugëtimit dhe hapet e nesërmja.
 *
 * Katër nota që ngjiten (Do–Mi–Sol–Do), pra një akord i madh i shpalosur: ai
 * tingëllon si diçka që HAPET, ndërsa dy nota tingëllojnë si diçka që mbyllet.
 * Zgjat rreth gjysmë sekonde — sa për ta ndier, jo sa për të pritur.
 */
export function tingulliShkycjes() {
  try {
    const ac = merrKontekstin();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();

    const master = ac.createGain();
    master.gain.value = 0.14;
    master.connect(ac.destination);

    const t = ac.currentTime;
    /* Do5, Mi5, Sol5, Do6 — terca e madhe, kuinta, oktava. */
    [523.25, 659.25, 783.99, 1046.5].forEach((frekuenca, i) => {
      noteAt(ac, master, frekuenca, t + i * 0.085, i === 3 ? 0.55 : 0.3, i === 3 ? 0.8 : 0.6);
    });
  } catch {
    /* Tingulli është shtesë: nëse shfletuesi e ndalon, ndërfaqja vazhdon. */
  }
}

/**
 * Zgjon sistemin e zërit brenda një prekjeje.
 *
 * ⚠️  EKZISTON PËR TINGUJT QË NUK VIJNË NGA NJË KLIKIM.
 *
 *     Ekrani i përmbylljes shfaqet kur MBARON dëgjimi — pra pa asnjë prekje në
 *     atë çast. Nëse `AudioContext` krijohet pikërisht atëherë, iOS-i dhe
 *     Safari e lënë "suspended" dhe tingulli i fitores nuk dëgjohet kurrë.
 *
 *     Prandaj thirret te `play()`, pra kur përdoruesi shtyp "Luaj": konteksti
 *     hapet brenda prekjes dhe mbetet i zgjuar deri në fund të seancës.
 */
export function zgjoTingujt() {
  try {
    const ac = merrKontekstin();
    if (ac?.state === "suspended") ac.resume();
  } catch {
    /* Pa zë, aplikacioni vazhdon njësoj. */
  }
}

/**
 * "Fitorja" — kur mbaron seanca dhe hapet ekrani i përmbylljes.
 *
 * Katër nota që ngjiten shpejt (Do–Mi–Sol–Do), dhe mbi to një akord i madh që
 * mbahet: vrapi jep arritjen, akordi i qëndrueshëm jep shpërblimin. Ndryshe
 * nga `tingulliShkycjes`, që hap diçka, ky e MBYLL diçka — prandaj akordi rri
 * deri në fund në vend që të shuhet notë pas note.
 */
export function tingulliFitores() {
  try {
    const ac = merrKontekstin();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();

    const master = ac.createGain();
    master.gain.value = 0.13;
    master.connect(ac.destination);

    const t = ac.currentTime;

    /* Vrapi: Do5, Mi5, Sol5, Do6 — i shpejtë, 70 ms mes notave. */
    [523.25, 659.25, 783.99, 1046.5].forEach((frekuenca, i) => {
      noteAt(ac, master, frekuenca, t + i * 0.07, 0.22, 0.65);
    });

    /* Akordi i mbajtur: Do6, Mi6, Sol6 — hyn sapo mbaron vrapi. */
    const akordi = ac.createGain();
    akordi.gain.value = 0.6;
    akordi.connect(master);
    [1046.5, 1318.51, 1567.98].forEach((frekuenca, i) => {
      noteAt(ac, akordi, frekuenca, t + 0.3 + i * 0.02, 1.1, i === 0 ? 0.6 : 0.34);
    });
  } catch {
    /* Tingulli është shtesë: nëse shfletuesi e ndalon, ndërfaqja vazhdon. */
  }
}

/**
 * "Mbushja" — tingulli që shoqëron shiritin e gjenerimit te "Krijo".
 *
 * Një notë e vetme që NGJITET pa ndërprerje nga Sol2 te Sol5, plus një kuintë
 * mbi të, e zbehtë, që i jep shkëlqim. Në fund bie një çift notash si shenjë
 * se mbaroi.
 *
 * ⚠️  E TËRA PLANIFIKOHET NJËHERËSH, me orën e Web Audio-s — jo me `setInterval`
 *     që ndjek shiritin. Ora e JavaScript-it vonohet sa herë faqja ka punë tjetër
 *     (dhe pikërisht atëherë ka: animacion, render, ndërtim sekuence), ndaj
 *     tingulli do të hikëllonte. Ora e audios rrjedh veç dhe nuk e prek asgjë.
 *
 * ⚠️  Thirret NGA KLIKIMI, jo nga një efekt i ekranit të gjenerimit. iOS-i e
 *     lejon zërin vetëm kur konteksti krijohet ose zgjohet brenda një prekjeje;
 *     një efekt rrjedh një hap më vonë, dhe tingulli do të mungonte pikërisht
 *     te telefonat.
 *
 * @param {number} gjatesiaMs sa zgjat mbushja — jepet nga `GenerateProgress`,
 *                            që tingulli dhe shiriti të mbarojnë bashkë
 */
export function tingulliMbushjes(gjatesiaMs = 1400) {
  try {
    const ac = merrKontekstin();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();

    const t = ac.currentTime;
    /* Nën 0,4 s ngjitja nuk dëgjohet si ngjitje, por si kërcitje. */
    const gjatesia = Math.max(0.4, gjatesiaMs / 1000);
    const fundi = t + gjatesia;

    const master = ac.createGain();
    /* Hyn butë dhe del butë: një fillim i prerë dëgjohet si klikim. */
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.09, t + 0.18);
    master.gain.setValueAtTime(0.09, fundi - 0.12);
    master.gain.exponentialRampToValueAtTime(0.0001, fundi);
    master.connect(ac.destination);

    /* Nota bazë: Sol2 → Sol5, tre oktava ngjitje. */
    const baza = ac.createOscillator();
    baza.type = "sine";
    baza.frequency.setValueAtTime(98, t);
    baza.frequency.exponentialRampToValueAtTime(784, fundi);
    baza.connect(master);
    baza.start(t);
    baza.stop(fundi + 0.05);

    /* Kuinta mbi të — e njëjta ngjitje, më e qetë, vetëm për shkëlqim. */
    const shkelqimi = ac.createGain();
    shkelqimi.gain.value = 0.35;
    shkelqimi.connect(master);

    const kuinta = ac.createOscillator();
    kuinta.type = "sine";
    kuinta.frequency.setValueAtTime(147, t);
    kuinta.frequency.exponentialRampToValueAtTime(1176, fundi);
    kuinta.connect(shkelqimi);
    kuinta.start(t);
    kuinta.stop(fundi + 0.05);

    /*
     * Mbyllja: Do6 dhe Sol6 bashkë, te çasti kur shiriti prek 100%.
     *
     * Pa të, ngjitja do të ndalte pa u zgjidhur — veshi pret një pikë në fund,
     * njësoj si syri pret që shiriti të mbushet deri në buzë.
     */
    const kambana = ac.createGain();
    kambana.gain.value = 0.5;
    kambana.connect(ac.destination);
    noteAt(ac, kambana, 1046.5, fundi, 0.5, 0.55);
    noteAt(ac, kambana, 1567.98, fundi + 0.04, 0.45, 0.32);
  } catch {
    /* Tingulli është shtesë: nëse shfletuesi e ndalon, ndërfaqja vazhdon. */
  }
}
