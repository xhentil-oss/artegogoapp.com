/**
 * CAKTIMI I ETIKETAVE — teknikë + kategori për çdo meditim.
 *
 * Meditimet ruhen një herë të vetme te `collections.js`, të grupuara sipas
 * nën-temës. Këtu nën-tema përkthehet në të dyja etiketat:
 *
 *   nën-tema ──> TEKNIKA   (SI bëhet)
 *            └─> KATEGORIA (PËR ÇFARË qëllimi)
 *
 * Çelësi është `"idKoleksioni/emriNënTemës"`, sepse emra si "Aktivizim" ose
 * "Manifestim" përsëriten në koleksione të ndryshme dhe do të përplaseshin
 * po të përdorej vetëm emri.
 *
 * ⚠️ Ky është caktim AUTOMATIK i prototipit, siç e parasheh specifikimi.
 *    Klienti do të japë caktimin përfundimtar teknikë+kategori për çdo audio
 *    reale. Ndryshimi bëhet vetëm këtu — asnjë komponent nuk preket.
 */

/** nën-tema → teknika */
export const SUB2TECH = {
  /* Meditime të Udhëhequra */
  "col_med/Emocione": "t_heal",
  "col_med/Zemra": "t_heart",
  "col_med/Vetëbesimi": "t_reprog",
  "col_med/Truri": "t_brain",
  "col_med/Gjumi": "t_body",
  "col_med/Energjia": "t_body",
  "col_med/Manifestimi": "t_manifest",

  /* EFT (Tapping) */
  "col_eft/Ankthi": "t_eft",
  "col_eft/Marrëdhënie": "t_eft",
  "col_eft/Biznes": "t_eft",
  "col_eft/Trupi": "t_eft",
  "col_eft/Varësi": "t_eft",

  /* Frymëmarrje */
  "col_breath/Aktivizim": "t_breath",
  "col_breath/Qetësim": "t_breath",
  "col_breath/Performancë": "t_breath",
  "col_breath/Manifestim": "t_breath",
  "col_breath/Shërim": "t_breath",

  /* Praktika Somatike — lëvizja shkon te "Meditim në ecje" */
  "col_somatic/Lirim & Çlirim": "t_somatic",
  "col_somatic/Tokëzim & Lëvizje": "t_walk",
  "col_somatic/Lirim i zonave": "t_somatic",

  /* Praktika Energjitike */
  "col_energy/Aura & Mbrojtje": "t_energy",
  "col_energy/Aktivizim": "t_energy",
  "col_energy/Vibracioni": "t_energy",

  /* Vizualizime */
  "col_visual/Vetja": "t_visual",
  "col_visual/Jeta ideale": "t_visual",

  /* Afirmime */
  "col_affirm/Zhvillim personal": "t_affirm",
  "col_affirm/Role": "t_affirm",

  /* Hipnoza */
  "col_hypno/Transformim": "t_hypno",

  /* Për Çdo Moment */
  "col_moment/Mëngjes": "t_body",
  "col_moment/Në makinë": "t_breath",
  "col_moment/Në punë": "t_brain",
  "col_moment/Në shtëpi": "t_heal",

  /* Emergjencë */
  "col_emergency/Krizë akute": "t_breath",

  /* Shëndet */
  "col_health/Dhimbje & Tension": "t_heal",
  "col_health/Gjendje kronike": "t_heal",
  "col_health/Cikli & Hormonet": "t_heal",

  /* Marrëdhënie */
  "col_rel/Lidhjet": "t_heart",
  "col_rel/Brenda vetes": "t_heart",

  /* Biznesi */
  "col_biz/Mendësia": "t_reprog",
  "col_biz/Aftësi": "t_brain",

  /* Fëmijët */
  "col_kids/Për fëmijë": "t_heart",
  "col_kids/Familje": "t_heart",

  /* Sfida të Drejtuara */
  "col_challenge/Sfidat": "t_reprog",
};

/** nën-tema → kategoria (harta SUB2CAT e specifikimit) */
export const SUB2CAT = {
  "col_med/Emocione": "c_emocionet",
  "col_med/Zemra": "c_zemra",
  "col_med/Vetëbesimi": "c_vetebesim",
  "col_med/Truri": "c_tru",
  "col_med/Gjumi": "c_gjumi",
  "col_med/Energjia": "c_energji",
  "col_med/Manifestimi": "c_manifestim",

  "col_eft/Ankthi": "c_ankth",
  "col_eft/Marrëdhënie": "c_marredhenie",
  "col_eft/Biznes": "c_vetebesim",
  "col_eft/Trupi": "c_shendeti",
  "col_eft/Varësi": "c_varesi",

  "col_breath/Aktivizim": "c_energji",
  "col_breath/Qetësim": "c_stres",
  "col_breath/Performancë": "c_fokus",
  "col_breath/Manifestim": "c_bolleku",
  "col_breath/Shërim": "c_shendeti",

  "col_somatic/Lirim & Çlirim": "c_kaluara",
  "col_somatic/Tokëzim & Lëvizje": "c_qetesim",
  "col_somatic/Lirim i zonave": "c_shendeti",

  "col_energy/Aura & Mbrojtje": "c_situata",
  "col_energy/Aktivizim": "c_intuita",
  "col_energy/Vibracioni": "c_energji",

  "col_visual/Vetja": "c_vetja",
  "col_visual/Jeta ideale": "c_jeta",

  "col_affirm/Zhvillim personal": "c_dashuria",
  "col_affirm/Role": "c_vetebesim",

  "col_hypno/Transformim": "c_varesi",

  "col_moment/Mëngjes": "c_mengjes",
  "col_moment/Në makinë": "c_situata",
  "col_moment/Në punë": "c_fokus",
  "col_moment/Në shtëpi": "c_mbremje",

  "col_emergency/Krizë akute": "c_emergjence",

  "col_health/Dhimbje & Tension": "c_shendeti",
  "col_health/Gjendje kronike": "c_shendeti",
  "col_health/Cikli & Hormonet": "c_shendeti",

  "col_rel/Lidhjet": "c_marredhenie",
  "col_rel/Brenda vetes": "c_falja",

  "col_biz/Mendësia": "c_vetebesim",
  "col_biz/Aftësi": "c_fokus",

  "col_kids/Për fëmijë": "c_femije_0_7",
  "col_kids/Familje": "c_femije_8_12",

  "col_challenge/Sfidat": "c_situata",
};

/** Çelësi i përbashkët i të dy hartave. */
export const subKey = (collectionId, groupName) => `${collectionId}/${groupName}`;
