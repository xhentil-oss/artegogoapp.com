/**
 * RENDITJA E RITMIT DITOR
 *
 * Kërkesë e klientes, 20 nëntor 2026: tre hapat e ditës nuk zgjidhen më nga
 * një rregull, por ndjekin një listë të caktuar prej saj. Dita 1 jep zërin e
 * parë të secilës listë, dita 2 të dytin, e kështu me radhë; kur një listë
 * mbaron, nis nga kreu.
 *
 * ⚠️  LISTAT KANË GJATËSI TË NDRYSHME (12 · 11 · 12), ME QËLLIM. Secila ecën
 *     më vete, ndaj çiftëzimi mëngjes–drekë–darkë ndryshon nga java në javë
 *     dhe i njëjti trio nuk përsëritet para ditës 1 584. Po t'i barazonim,
 *     do të hiqnim një praktikë nga dreka vetëm për simetri.
 *
 * ⚠️  `id` ËSHTË ÇELËSI, TITULLI ËSHTË RRJETA. Identifikuesit vijnë nga
 *     databaza dhe nuk ndryshojnë kur një titull redaktohet te paneli. Por
 *     nëse katalogu rimbushet ndonjëherë nga e para, identifikuesit humbasin
 *     dhe titulli e gjen zërin prapë. Të dyja bashkë mbijetojnë secilin
 *     ndryshim veç e veç.
 *
 * ⚠️  NUK SHTOHET ME DORË NJË ZË QË NUK EKZISTON TE KATALOGU. Një hyrje që
 *     nuk gjendet kapërcehet në heshtje dhe hapi merr të ardhshmen e listës —
 *     pra një gabim shtypi nuk e zbraz ekranin, por as nuk shihet. Lista u
 *     verifikua kundrejt `/content/meditations` ditën që u shkrua: 35 zëra,
 *     35 përputhje.
 */
export const RHYTHM_ORDER = {
  /* ---------- MËNGJES · 12 praktika ---------- */
  morning: [
    { id: "5ecc1ba5-a510-11f1-b99e-107c614af9b1", title: "Shkundje somatike" },  // dita 1
    { id: "5ecaed4e-a510-11f1-b99e-107c614af9b1", title: "Aktivizo një cilësi dhe fito energji në mëngjes" },
    { id: "5ecde47e-a510-11f1-b99e-107c614af9b1", title: "Dita më e bukur" },
    { id: "5ecfb327-a510-11f1-b99e-107c614af9b1", title: "Foli vetes pozitivisht" },
    { id: "5ec89d2c-a510-11f1-b99e-107c614af9b1", title: "Aktivizo vetëvlerësimin" },
    { id: "5ec89f52-a510-11f1-b99e-107c614af9b1", title: "Aktivizo intuitën" },
    { id: "5ed09755-a510-11f1-b99e-107c614af9b1", title: "Tejkalo prokrastinimin dhe rrit produktivitetin" },
    { id: "73b9c201-ab5c-11f1-97ee-107c614af9b1", title: "Meditim për të gjetur rrugën më të lartë" },
    { id: "73b9e07d-ab5c-11f1-97ee-107c614af9b1", title: "Meditim për të marrë dhe rrezatuar dritë" },
    { id: "73b9df5f-ab5c-11f1-97ee-107c614af9b1", title: "Meditim për të manifestuar me dritë" },
    { id: "f67c48c6-ddb3-11f1-af71-107c614af9b1", title: "Vizualizim për bollëk" },
    { id: "5ecd02f4-a510-11f1-b99e-107c614af9b1", title: "Afirmime për bollëk financiar" },
  ],

  /* ---------- DREKË · 11 praktika ---------- */
  midday: [
    { id: "5eccf9af-a510-11f1-b99e-107c614af9b1", title: "Ec dhe ndiej energjinë e jetës së re" },  // dita 1
    { id: "5ec89d72-a510-11f1-b99e-107c614af9b1", title: "Ndiej motivim dhe përfundo punën me sukses" },
    { id: "5ecfb02f-a510-11f1-b99e-107c614af9b1", title: "Pushim meditativ për rigjenerim" },
    { id: "5ec89463-a510-11f1-b99e-107c614af9b1", title: "Sill një emocion të ri" },
    { id: "5ed099cc-a510-11f1-b99e-107c614af9b1", title: "Qetësohu pas një konflikti" },
    { id: "5ecaf349-a510-11f1-b99e-107c614af9b1", title: "EFT për ankthin" },
    { id: "5ecc1a98-a510-11f1-b99e-107c614af9b1", title: "Box breathing" },
    { id: "5ecc1612-a510-11f1-b99e-107c614af9b1", title: "Frymëmarrje ritmike 4x6 për lirim nga stresi" },
    { id: "5ecc15d3-a510-11f1-b99e-107c614af9b1", title: "Frymëmarrje ritmike 4x7x8 para gjumit për qetësim" },
    { id: "5ecc158c-a510-11f1-b99e-107c614af9b1", title: "Relaksim i thellë me frymëmarrje 4x8" },
    { id: "5ecc1a59-a510-11f1-b99e-107c614af9b1", title: "Rikthe koherencën e zemrës me frymëmarrje 5x5" },
  ],

  /* ---------- DARKË · 12 praktika ---------- */
  evening: [
    { id: "5ecde7a2-a510-11f1-b99e-107c614af9b1", title: "Rikthe energjinë" },  // dita 1
    { id: "5ec896d7-a510-11f1-b99e-107c614af9b1", title: "Liro stresin" },
    { id: "5ec89868-a510-11f1-b99e-107c614af9b1", title: "Hap zemrën" },
    { id: "5ec898b3-a510-11f1-b99e-107c614af9b1", title: "Aktivizo dhembshurinë" },
    { id: "5ecfb137-a510-11f1-b99e-107c614af9b1", title: "Fuqizo lidhjen" },
    { id: "5ec898fd-a510-11f1-b99e-107c614af9b1", title: "Fal veten" },
    { id: "5ec89944-a510-11f1-b99e-107c614af9b1", title: "Fal dikë" },
    { id: "5ecaeefc-a510-11f1-b99e-107c614af9b1", title: "Meditim për të ndier falenderim" },
    { id: "73b9e006-ab5c-11f1-97ee-107c614af9b1", title: "Meditim për të marrë bekime" },
    { id: "73b9e100-ab5c-11f1-97ee-107c614af9b1", title: "Meditim për të rritur ndërgjegjen" },
    { id: "73b9de8a-ab5c-11f1-97ee-107c614af9b1", title: "Meditim për të lexuar librin e jetës" },
    { id: "5ec8a03b-a510-11f1-b99e-107c614af9b1", title: "Fli shpejt" },
  ],

};
