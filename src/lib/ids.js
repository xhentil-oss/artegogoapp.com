/**
 * A vjen kjo id nga databaza?
 *
 * Aplikacioni mban dy lloje përmbajtjeje me id të ndryshme:
 *   · meditimet e serverit — UUID (`88416b08-a2e3-11f1-b99e-107c614af9b1`)
 *   · mini-blloqet lokale  — `b1`, `b2`… dhe katalogu i fallback-ut `c1001`
 *
 * ⚠️  Dallimi ka rëndësi te çdo shkrim që i referohet një meditimi. Një id që
 *     nuk ekziston te databaza nuk ka ku të lidhet: seanca refuzohet me çelës
 *     të huaj, dhe i preferuari — para se `me.js` të kontrollonte ekzistencën —
 *     kthente `204` pa shkruar asgjë.
 *
 *     Prandaj kontrolli bëhet PARA dërgimit: një kërkesë që dihet se do të
 *     dështojë nuk duhet nisur, dhe përdoruesi nuk duhet të shohë gabim për
 *     diçka që aplikacioni e dinte që në fillim.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isDatabaseId = (id) => typeof id === "string" && UUID.test(id);
