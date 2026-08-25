/**
 * SLOT_POOLS — cilat meditime hyjnë në secilin çast të ditës (seksioni 9).
 *
 * Ekzistojnë tre pool-e: mëngjes, drekë, darkë. Çdo ditë njoftimi merr një
 * meditim rastësor nga pool-i i duhur.
 *
 * ⚠️  KJO ËSHTË ZGJEDHJE E KLIENTIT, jo e kodit.
 *     Këtu janë shkruar nën-grupe të tëra, sepse ashtu lista mbetet e shkurtër
 *     dhe e lexueshme — Artemisa mund të shtojë ose të heqë një rresht pa
 *     prekur asgjë tjetër. Nëse më vonë duhet përzgjedhje meditim-për-meditim,
 *     ndryshon vetëm forma e kësaj liste; `domain/dailyPick.js` nuk e di se si
 *     mbushet pool-i.
 *
 * Çelësat janë "koleksion/nën-grup" — e njëjta formë si te
 * `data/classification.js`, sepse emrat e nën-grupeve përsëriten nëpër
 * koleksione ("Aktivizim" gjendet te Frymëmarrja dhe te Energjitikat).
 *
 * Kriteri i ndarjes:
 *   · mëngjes — zgjim, energji, qëllim, fokus për ditën përpara
 *   · drekë   — rikthim i vëmendjes dhe shkarkim tensioni në mes të ditës
 *   · darkë   — qetësim, zemra, shërim, gjumë
 */
export const SLOT_POOLS = {
  morning: [
    "col_moment/Mëngjes",
    "col_med/Energjia",
    "col_med/Vetëbesimi",
    "col_breath/Aktivizim",
    "col_energy/Aktivizim",
    "col_affirm/Zhvillim personal",
    "col_visual/Jeta ideale",
  ],
  noon: [
    "col_moment/Në punë",
    "col_moment/Në makinë",
    "col_med/Truri",
    "col_breath/Performancë",
    "col_biz/Aftësi",
    "col_somatic/Tokëzim & Lëvizje",
    "col_eft/Ankthi",
  ],
  evening: [
    "col_moment/Në shtëpi",
    "col_med/Gjumi",
    "col_med/Zemra",
    "col_breath/Qetësim",
    "col_breath/Shërim",
    "col_somatic/Lirim & Çlirim",
    "col_rel/Brenda vetes",
  ],
};
