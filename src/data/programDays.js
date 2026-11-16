/**
 * DITËT E PROGRAMEVE — cili meditim bie në cilën ditë.
 *
 * ⚠️  Pa këtë listë, `programStops` i merrte ndalesat me radhë nga pishina e
 *     meditimeve të atij qëllimi dhe, kur ditët ishin më shumë se meditimet,
 *     e rinisnin ciklin: "MISTIK ZEMËR" ka 7 ditë por vetëm 3 meditime me
 *     qëllimin `heart`, ndaj dita 4 ishte prapë dita 1, dita 5 prapë dita 2.
 *     Klientja e pa dhe e kërkoi rendin e vet (16 nëntor 2026).
 *
 * ⚠️  Çelësi është `intent`-i i programit, JO id-ja. Programet vijnë nga
 *     serveri me id të databazës; një hartë sipas "p1"…"p4" do të ishte bosh
 *     në prodhim. (I njëjti arsyetim si te `PROGRAM_COVERS`.)
 *
 * ⚠️  Vlerat janë TITUJ, jo id. Titulli është i njëjti te katalogu i serverit
 *     dhe te fallback-u lokal, kurse id-të ndryshojnë mes të dyve — një listë
 *     me UUID do të zbrazej sapo serveri të mos lexohej.
 *
 *     Titulli duhet të përputhet SAKTË me atë të katalogut (pa dallim
 *     shkronje të madhe/vogël). Një titull që nuk gjendet nuk e lë ditën
 *     bosh: ajo kthehet te sjellja e vjetër, pra te pishina e qëllimit.
 *
 * Ditët e programeve të tjera i shton klientja; derisa t'i japë, ato mbeten
 * si më parë.
 */
export const PROGRAM_DAYS = {
  /* MISTIK ZEMËR — 7 ditë (lista e klientes, 16 nëntor 2026). */
  heart: [
    "Aktivizo dhembshurinë",
    "Foli vetes pozitivisht",
    "Fal veten",
    "Fal dikë",
    "Hap zemrën",
    "Fuqizo lidhjen",
    "Sill një emocion të ri",
  ],

  /*
   * TRANSFORMIM — 21 ditë (lista e klientes, 16 nëntor 2026).
   *
   * Dita 7 është "Rikthe energjinë" me kërkesë të saj, në vend të "Fuqizo
   * lidhjen" që ishte te lista e parë.
   *
   * Pesë tituj te lista ishin të shkurtuar; këtu rrinë ashtu siç janë te
   * katalogu, sepse përputhja bëhet me titullin e plotë. Forma e shkurtër e
   * secilit është shënuar pranë.
   */
  transform: [
    "Liro stresin",
    "Pushim meditativ për rigjenerim",
    "Aktivizo dhembshurinë",
    "Fal veten",
    "Fal dikë",
    "Hap zemrën",
    "Rikthe energjinë",
    "Foli vetes pozitivisht",
    "Aktivizo vetëvlerësimin",
    "Sill një emocion të ri",
    "Aktivizo një cilësi dhe fito energji në mëngjes", // "Aktivizo një cilësi"
    "Tejkalo prokrastinimin dhe rrit produktivitetin", // "Tejkalo prokrastinimin — Jam i mjaftueshëm"
    "Ndiej motivim dhe përfundo punën me sukses",      // "Ndiej motivim"
    "Ec dhe ndiej energjinë e jetës së re",            // "Ec me një energji të re"
    "Meditim për të rritur ndërgjegjen",
    "Aktivizo intuitën",
    "Meditim për të gjetur rrugën më të lartë",        // "Gjej rrugën më të lartë"
    "Meditim për të lexuar librin e jetës",
    "Vizualizim për bollëk",
    "Meditim për të manifestuar me dritë",
    "Meditim për të marrë bekime",
  ],

  /*
   * GJUMË I QETË — 10 ditë (lista e klientes, 16 nëntor 2026).
   *
   * Titujt përsëriten me qëllim: programi ka 10 ditë dhe katër meditime, dhe
   * rendi i përsëritjes është i sajin — jo cikli automatik që kishim më parë.
   */
  sleep: [
    "Fli shpejt",
    "Liro stresin",
    "Pushim meditativ për rigjenerim",
    "Fli shpejt",
    "Aktivizo dhembshurinë",
    "Rikthe energjinë",
    "Pushim meditativ për rigjenerim",
    "Liro stresin",
    "Rikthe energjinë",
    "Fli shpejt",
  ],
};
