import { api, hasToken } from "./api.js";
import { REMINDER_SLOTS, defaultReminders } from "../data/reminders.js";

/**
 * ═══════════════════════════════════════════════════════════════
 *  KUJTESAT — nga shfletuesi te serveri
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️  DERI TANI NUK SHKONIN FARE.
 *
 *     Oraret e mëngjesit, drekës dhe darkës ruheshin vetëm te profili lokal
 *     (`STORAGE_KEYS.onboarding`). Tabela `reminders` te databaza mbushej nga
 *     trigger-i me të tria TË FIKURA, dhe asgjë nuk ia thoshte kurrë serverit
 *     se përdoruesi i kishte ndezur.
 *
 *     Pasoja ishte e heshtur dhe e plotë: cron-i lexon pikërisht atë tabelë
 *     (`WHERE r.is_enabled = 1`), ndaj nuk dërgonte asnjë kujtesë meditimi —
 *     ndërsa aplikacioni tregonte ndërprerësit e ndezur dhe orarin e zgjedhur.
 *     Njoftimet e rrugëtimit vinin, sepse ato nuk varen nga kjo tabelë; prandaj
 *     te zilja dukeshin vetëm ato.
 *
 * Çelësat ndryshojnë mes dy anëve: aplikacioni e quan çastin e mesditës
 * `noon` (si pool-in e meditimeve), databaza `midday`. Përkthimi bëhet VETËM
 * këtu — asnjë ekran nuk duhet ta dijë se ekzistojnë dy emra.
 */
const TYPE_BY_SLOT = { morning: "morning", noon: "midday", evening: "evening" };
const SLOT_BY_TYPE = { morning: "morning", midday: "noon", evening: "evening" };

/** "07:00" — ora pa sekonda, ashtu si e mban aplikacioni. */
const hhmm = (value) => String(value ?? "").slice(0, 5);

/** Gjendja te serveri, në formën e aplikacionit; `null` kur nuk lexohet dot. */
async function pull() {
  try {
    const rows = await api.get("/me/reminders");
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const state = {};
    for (const row of rows) {
      const slot = SLOT_BY_TYPE[row.reminder_type];
      if (!slot) continue;
      state[slot] = { enabled: Number(row.is_enabled) > 0, time: hhmm(row.time_of_day) };
    }
    /* Parazgjedhjet mbushin çdo çast që mungon: një rresht i fshirë me dorë
       nuk duhet ta lërë ekranin me një ndërprerës pa gjendje. */
    return { ...defaultReminders(), ...state };
  } catch {
    return null;
  }
}

/**
 * Dërgon VETËM çastet që ndryshojnë.
 *
 * Krahasimi bëhet ndaj asaj që serveri sapo ktheu, jo ndaj gjendjes së
 * mëparshme lokale: kështu një hapje e zakonshme e aplikacionit nuk prodhon
 * asnjë kërkesë, ndërsa një ndryshim i vërtetë shkon gjithmonë.
 */
async function pushChanges(remote, local) {
  const changed = REMINDER_SLOTS.filter((slot) => {
    const before = remote?.[slot.id];
    const after = local?.[slot.id];
    if (!after) return false;
    return (
      Boolean(before?.enabled) !== Boolean(after.enabled) ||
      hhmm(before?.time) !== hhmm(after.time)
    );
  });

  await Promise.all(
    changed.map((slot) =>
      api.put(`/me/reminders/${TYPE_BY_SLOT[slot.id]}`, {
        /* Sekondat shtohen këtu: kolona është `TIME`, dhe "07:00" pranohet, por
           forma e plotë e heq çdo dykuptimësi te logu i serverit. */
        time_of_day: `${hhmm(local[slot.id].time)}:00`,
        is_enabled: local[slot.id].enabled ? 1 : 0,
      })
    )
  );

  return changed.length;
}

/**
 * Pajton gjendjen lokale me atë të serverit dhe kthen atë që vlen.
 *
 * ⚠️  KUSH FITON, dhe pse jo gjithmonë serveri.
 *
 *     Derisa u shkrua kjo, oraret ishin caktuar VETËM te pajisja; serveri i
 *     mban të tria të fikura për këdo. Po ta zbatonim rregullin e zakonshëm
 *     ("serveri është burimi i vërtetë"), hapja e parë pas kësaj do t'i fikte
 *     kujtesat e gjithkujt — pikërisht e kundërta e asaj që pritet.
 *
 *     Prandaj: kur te serveri asnjë çast nuk është i ndezur, gjendja e ruajtur
 *     ngjitet lart. Përndryshe serveri fiton, dhe një telefon i dytë merr atë
 *     që u vendos te i pari.
 *
 * @returns {Promise<object|null>} gjendja që duhet përdorur, ose `null` kur nuk
 *          ka hyrje / serveri nuk arrihet (mbetet ajo lokale)
 */
export async function syncReminders(local) {
  if (!hasToken()) return null;

  const remote = await pull();
  if (!remote) return null;

  const serveriEshteBosh = REMINDER_SLOTS.every((slot) => !remote[slot.id]?.enabled);
  const effective = serveriEshteBosh && local ? local : remote;

  try {
    await pushChanges(remote, effective);
  } catch {
    /* Shkrimi dështoi — gjendja e kthyer mbetet e vlefshme për ekranin. */
  }
  return effective;
}

/** Ndryshimi i bërë nga përdoruesi: dërgohet menjëherë, çast për çast. */
export async function saveReminders(prev, next) {
  if (!hasToken()) return 0;
  try {
    return await pushChanges(prev, next);
  } catch {
    return 0;
  }
}
