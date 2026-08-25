import { MEDITATIONS } from "./classification.js";

/**
 * ÇFARË ËSHTË FALAS — seksioni 8 i katalogut.
 *
 * "Vetëm 3 meditime falas në gjithë aplikacionin (një për ankthin, një për
 * zemrën, një për trurin). Gjithçka tjetër është premium."
 *
 * Rregulli jeton këtu, si listë e vetme dhe e shkurtër. Më parë ishte një
 * flamur `premium` i shpërndarë nëpër të dhëna, dhe kishte rrëshqitur pa u
 * vënë re: nga 244 meditime, 92 ishin falas — tridhjetë herë më shumë se
 *ç'lejon modeli. Me një listë të vetme, numri është i dukshëm me sy dhe
 * përmbajtja e re lind premium, jo falas.
 *
 * Zgjedhja bëhet me (koleksion, nën-grup, titull), jo me `id`: id-të gjenerohen
 * me radhë (`c1001`, `c1002`…), ndaj do të zhvendoseshin te një meditim tjetër
 * sapo të shtohej përmbajtje mbi to.
 */

const FREE_PICKS = [
  { theme: "Ankthi", collectionId: "col_med", subTheme: "Emocione", title: "Liro ankthin në 10 minuta" },
  { theme: "Zemra", collectionId: "col_med", subTheme: "Zemra", title: "Hap zemrën" },
  { theme: "Truri", collectionId: "col_med", subTheme: "Truri", title: "Fokus ekstrem" },
];

/** Të tria meditimet falas, të zgjidhura nga katalogu. */
export const FREE_MEDITATIONS = FREE_PICKS.map((pick) => {
  const found = MEDITATIONS.find(
    (item) =>
      item.collectionId === pick.collectionId &&
      item.subTheme === pick.subTheme &&
      item.title === pick.title
  );

  /* Dështo herët dhe me zë: një meditim falas që zhduket nga katalogu do ta
     linte modelin me dy — dhe askush nuk do ta vinte re në heshtje. */
  if (!found) {
    throw new Error(`Meditimi falas nuk u gjet në katalog: ${pick.collectionId}/${pick.title}`);
  }
  return { ...found, freeTheme: pick.theme };
});

const FREE_IDS = new Set(FREE_MEDITATIONS.map((item) => item.id));

/** Sa meditime lejon modeli të jenë falas. */
export const FREE_LIMIT = 3;

/** A është ky meditim një nga të tre falasit? */
export const isFreeMeditation = (item) => Boolean(item) && FREE_IDS.has(item.id);
