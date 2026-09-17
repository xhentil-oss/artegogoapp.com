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
