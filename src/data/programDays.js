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
};
