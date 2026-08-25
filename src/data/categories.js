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
 */
export const CATEGORIES = [
  { id: "c_emocionet",   label: "Emocionet",                                  intent: "stress" },
  { id: "c_zemra",       label: "Zemra plot",                                 intent: "heart" },
  { id: "c_vetebesim",   label: "Vetëbesim",                                  intent: "energy" },
  { id: "c_tru",         label: "Tru i fuqizuar",                             intent: "focus" },
  { id: "c_gjumi",       label: "Gjumi",                                      intent: "sleep" },
  { id: "c_energji",     label: "Energji e lartë",                            intent: "energy" },
  { id: "c_manifestim",  label: "Manifestim",                                 intent: "abundance" },
  { id: "c_stres",       label: "Stres",                                      intent: "stress" },
  { id: "c_ankth",       label: "Ankth/Panik/Fobi",                           intent: "stress" },
  { id: "c_marredhenie", label: "Përmirësimi i marrëdhënieve",                intent: "heart" },
  { id: "c_varesi",      label: "Tejkalim i varësive dhe zakoneve të vjetra", intent: "transform" },
  { id: "c_fokus",       label: "Fokus dhe performancë",                      intent: "focus" },
  { id: "c_shendeti",    label: "Shëndeti",                                   intent: "heal" },
  { id: "c_qetesim",     label: "Qetësim",                                    intent: "calm" },
  { id: "c_vetja",       label: "Vetja e së ardhmes",                         intent: "transform" },
  { id: "c_kaluara",     label: "Shëro të kaluarën",                          intent: "heal" },
  { id: "c_jeta",        label: "Jeta ideale",                                intent: "abundance" },
  { id: "c_falja",       label: "Falja",                                      intent: "selflove" },
  { id: "c_dashuria",    label: "Dashuria ndaj vetes",                        intent: "selflove" },
  { id: "c_intuita",     label: "Intuita",                                    intent: "transform" },
  { id: "c_bolleku",     label: "Bollëku",                                    intent: "abundance" },
  { id: "c_situata",     label: "Për situata të veçanta",                     intent: "calm" },
  { id: "c_emergjence",  label: "Emergjencë",                                 intent: "stress" },
  { id: "c_femije_0_7",  label: "Fëmijët 0–7",                                intent: "calm" },
  { id: "c_femije_8_12", label: "Fëmijët 8–12",                               intent: "calm" },
  { id: "c_adoleshentet",label: "Adoleshentët",                               intent: "focus" },
  { id: "c_mengjes",     label: "Mëngjes",                                    intent: "energy" },
  { id: "c_mbremje",     label: "Mbrëmje",                                    intent: "sleep" },
];
