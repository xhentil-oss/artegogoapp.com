/**
 * KATEGORITË — përgjigjen "PËR ÇFARË qëllimi" është meditimi.
 *
 * Etiketa e dytë e klasifikimit të dyfishtë. Rendi dhe emrat ndjekin
 * specifikimin (seksioni 4).
 *
 * ⚠️ Specifikimi e titullon listën "27 Kategoritë", por numëron 28 emra.
 *    Këtu janë të 28-ta, ashtu siç janë shkruar — mospërputhja e numrit
 *    duhet konfirmuar nga klienti.
 *
 * `intent` përcakton vetëm gradientin, jo klasifikimin.
 *
 * `icon` — pllaka 46×46 te "Eksploro kategoritë", te `public/ikona/`, e emërtuar
 * me slug-un e kategorisë (atë që njeh serveri, shih `services/taxonomy.js`).
 * Erdhën nga klientja më 13 nëntor 2026 si 20 figura 1254×1254 me emra
 * WhatsApp-i; secila u hap një nga një dhe u caktua sipas asaj që tregon.
 *
 * ⚠️  FIGURAT ERDHËN ME KORNIZË TË ZEZË. Pllaka me qoshe të rrumbullakosura
 *     rrinte mbi sfond të zi, dhe te kutia 46×46 ajo do të dukej si kornizë e
 *     errët rreth ikonës. Prandaj secila u pre: fillimisht te kufiri i pllakës,
 *     pastaj 7–10% më brenda, aq sa qoshet e rrumbullakosura të mos linin të
 *     zezë. Pas prerjes u vogëluan te 256 px — 3–8 KB secila.
 *
 *     Po të vijnë ikona të reja, duhet e njëjta punë; mos i vër ashtu siç vijnë.
 *
 * ⚠️  TETË KATEGORI RRINË PA IKONË: "Fëmijë dhe adoleshentë" (e vetmja me
 *     meditime), dhe shtatë që janë bosh e nuk shfaqen fare.
 *
 *     Fillimisht ishte "Emocionet" ajo që mbeti pa — zip-i kishte 20 figura
 *     për 21 kategori jo-bosh. Me kërkesë të klientes (13 nëntor), ikona e dy
 *     shkëndijave që buzëqeshin u zhvendos tek ajo: fytyra me shprehje është
 *     ajo që u rri më afër emocioneve. "Emocionet" rri e para te lista, pra
 *     mungesa u zhvendos atje ku bie më pak në sy. Kthehet duke ia dhënë
 *     sërish `icon` kategorisë `c_femije_8_12` dhe duke ia hequr
 *     `c_emocionet` — skedari është i njëjti. Pa `icon`, karta vizaton
 *     peizazhin procedural si më parë — `CoverArt` bie vetë te arti.
 */
export const CATEGORIES = [
  { id: "c_emocionet",   label: "Emocionet",                                  intent: "stress", icon: "/ikona/emocionet.jpeg" },
  { id: "c_zemra",       label: "Zemra plot",                                 intent: "heart", icon: "/ikona/zemra-plot.jpeg" },
  { id: "c_vetebesim",   label: "Vetëbesim",                                  intent: "energy", icon: "/ikona/vetebesim.jpeg" },
  { id: "c_tru",         label: "Tru i fuqizuar",                             intent: "focus", icon: "/ikona/tru-i-fuqizuar.jpeg" },
  { id: "c_gjumi",       label: "Gjumi",                                      intent: "sleep", icon: "/ikona/gjumi.jpeg" },
  /* ⚠️  "Ndiej bollëkun" rri ME QËLLIM këtu, jo te fundi ku ishte "Bollëku".
         `groupBy` i vizaton grupet sipas RENDIT TË KËSAJ LISTE, ndaj te dosja
         Afirmime do të dilte poshtë "Faljes" dhe "Dashurisë ndaj vetes" —
         meditimi i vërtetë nën vendmbajtësit. Këtu del i pari. */
  { id: "c_bolleku",     label: "Ndiej bollëkun",                             intent: "abundance", icon: "/ikona/bolleku.jpeg" },
  { id: "c_energji",     label: "Energji e lartë",                            intent: "energy", icon: "/ikona/energji-e-larte.jpeg" },
  { id: "c_manifestim",  label: "Manifestim",                                 intent: "abundance", icon: "/ikona/manifestim.jpeg" },
  { id: "c_stres",       label: "Liro stresin",                               intent: "stress", icon: "/ikona/stres.jpeg" },
  { id: "c_ankth",       label: "Ankth/Panik/Fobi",                           intent: "stress", icon: "/ikona/ankth-panik.jpeg" },
  { id: "c_marredhenie", label: "Përmirësimi i marrëdhënieve",                intent: "heart", icon: "/ikona/marredheniet.jpeg" },
  { id: "c_varesi",      label: "Tejkalim i varësive dhe zakoneve të vjetra", intent: "transform" },
  { id: "c_fokus",       label: "Fokus dhe performancë",                      intent: "focus", icon: "/ikona/fokus.jpeg" },
  { id: "c_shendeti",    label: "Shëndeti",                                   intent: "heal", icon: "/ikona/shendeti.jpeg" },
  { id: "c_qetesim",     label: "Qetësim",                                    intent: "calm", icon: "/ikona/qetesim.jpeg" },
  { id: "c_vetja",       label: "Vetja e së ardhmes",                         intent: "transform" },
  { id: "c_kaluara",     label: "Shëro të kaluarën",                          intent: "heal" },
  { id: "c_jeta",        label: "Jeta ideale",                                intent: "abundance" },
  { id: "c_falja",       label: "Falja",                                      intent: "selflove", icon: "/ikona/falja.jpeg" },
  { id: "c_dashuria",    label: "Dashuria ndaj vetes",                        intent: "selflove", icon: "/ikona/dashuria-vetes.jpeg" },
  { id: "c_intuita",     label: "Intuita",                                    intent: "transform", icon: "/ikona/intuita.jpeg" },
  { id: "c_situata",     label: "Për situata të veçanta",                     intent: "calm", icon: "/ikona/situata.jpeg" },
  { id: "c_emergjence",  label: "Emergjencë",                                 intent: "stress" },
  { id: "c_femije_0_7",  label: "Fëmijët 0–7",                                intent: "calm" },
  { id: "c_femije_8_12", label: "Fëmijë dhe adoleshentë",                      intent: "calm" },
  { id: "c_adoleshentet",label: "Adoleshentët",                               intent: "focus" },
  { id: "c_mengjes",     label: "Mëngjes",                                    intent: "energy", icon: "/ikona/mengjes.jpeg" },
  { id: "c_mbremje",     label: "Mbrëmje",                                    intent: "sleep", icon: "/ikona/mbremje.jpeg" },
];
