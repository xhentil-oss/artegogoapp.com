/**
 * ÇFARË ËSHTË FALAS — asgjë.
 *
 * ⚠️  MODELI NDRYSHOI (3 shtator 2026, vendim i klientes).
 *
 *     Seksioni 8 i katalogut thoshte: "Vetëm 3 meditime falas në gjithë
 *     aplikacionin (një për ankthin, një për zemrën, një për trurin)."
 *     Ai rregull U HOQ. Tani i gjithë katalogu është i kyçur, dhe e vetmja
 *     rrugë drejt tij është prova 3-ditore falas, që hapet nga abonimi dhe
 *     zhbllokon gjithçka.
 *
 *     Skedari mbetet — nuk u fshi — sepse `usePlayback` dhe kartat e pyetin
 *     këtu se çfarë është e hapur. Duke e mbajtur, rregulli qëndron në një
 *     vend të vetëm: nëse ndonjëherë kthehen meditime falas, ndryshon vetëm
 *     `isFreeMeditation` dhe asnjë ekran.
 *
 *     Lista e vjetër e tre meditimeve u hoq bashkë me `FREE_PICKS`. Mbajtja e
 *     saj "për referencë" do të krijonte dyshim se rregulli ende vlen — dhe
 *     historiku i git-it e mban gjithsesi.
 *
 * ⚠️  E vërteta e aksesit është TE SERVERI, jo këtu.
 *     `GET /audio/:id` kontrollon abonimin para se të dorëzojë skedarin, dhe
 *     `meditations.is_premium = 1` për të gjitha. Kjo shtresë vendos vetëm
 *     çfarë SHFAQET; një klient i ndryshuar nuk fiton asgjë.
 */

/** Sa meditime lejon modeli të jenë falas. Zero. */
export const FREE_LIMIT = 0;

/** Lista e meditimeve falas — bosh, dhe mbetet bosh. */
export const FREE_MEDITATIONS = [];

/**
 * A është ky meditim falas?
 *
 * Gjithmonë `false`. Fusha `premium` e serverit nderohet po ashtu: nëse një
 * meditim vjen me `is_premium = 0` (p.sh. një rresht i vjetër te databaza),
 * ai NUK hapet — modeli i tanishëm nuk njeh përjashtime, dhe një rresht i
 * harruar te databaza nuk duhet të bëhet vrimë.
 */
export const isFreeMeditation = () => false;
