-- ═══════════════════════════════════════════════════════════════
--  15 · PËRSHKRIMET E MEDITIMEVE
-- ═══════════════════════════════════════════════════════════════
--
--  Të 250 meditimet e katalogut kishin të njëjtin përshkrim të gjeneruar:
--  '<titulli> — praktikë e udhëhequr nga Arte Gogo.' Fleta e meditimit e
--  tregonte atë rresht dhe nuk thoshte asgjë për përmbajtjen, ndaj vendimi
--  për ta dëgjuar merrej pa asnjë të dhënë.
--
--  Këtu secili merr tekstin e vet, shkruar sipas teknikës (si bëhet),
--  kategorisë (për çfarë shërben) dhe temës së titullit.
--
--  ⚠️  NUK E MBISHKRUAN PUNËN TËNDE. Çdo UPDATE ka kusht që përshkrimi aktual
--      të jetë ende ai i gjeneruari ose bosh. Nëse e ke rishkruar vetë një
--      meditim, ai rresht nuk preket — dhe skedari mund të rrjedhë sërish pa
--      frikë.
--
--  ⚠️  Meditimet me temë shëndeti e mbajnë shënimin se janë praktika
--      SHOQËRUESE dhe nuk zëvendësojnë trajtimin mjekësor. Mos e hiq atë
--      fjali pa e menduar: aplikacioni nuk është pajisje mjekësore, dhe
--      premtimi i shërimit është edhe i pasaktë edhe i rrezikshëm.
--
--  SI RRJEDHET: phpMyAdmin → zgjidh databazën → skeda 'Import' → zgjidh këtë
--  skedar → Go. (Ose skeda 'SQL', dhe ngjit përmbajtjen.)
--
--  KONTROLLI PAS RRJEDHJES:
--      SELECT COUNT(*) FROM meditations
--       WHERE is_block = 0
--         AND description LIKE '%praktikë e udhëhequr nga Arte Gogo%';
--    → duhet të kthejë 0.
-- ═══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;


-- ─────────────── Meditime riprogramimi (31) ───────────────

-- 14 ditë zemra · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 14-ditore për zemrën. Çdo seancë nis me qetësim të trupit, pastaj sjell në sipërfaqe një bindje të vjetër për dashurinë dhe e zëvendëson me një fjali të re, të thënë në vetën e parë. Dëgjohet një herë në ditë, në të njëjtën orë.'
 WHERE id = '5ed09bb2-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- 21 ditë meditimi · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 21-ditore që ndërton zakonin e uljes. Secila ditë ka të njëjtën strukturë — qetësim, vëmendje te fryma, një fjali riprogramuese — që praktika të mos varet nga disponimi, por nga radha. Përsëritja është pikërisht ajo që e ngulit.'
 WHERE id = '5ed09bf5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- 21 ditë vetëdashurie · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 21-ditore për marrëdhënien me veten. Punon me gjykimin e brendshëm: e njeh zërin që kritikon, e dëgjon pa u përleshur me të, dhe e zëvendëson me një mënyrë tjetër të folurit ndaj vetes.'
 WHERE id = '5ed09a71-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- 30 ditë bollëku · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 30-ditore për bindjet mbi paranë dhe meritën. Çdo seancë prek një frazë të trashëguar — që paraja është e vështirë, që nuk mjafton — dhe e zëvendëson me një pohim që trupi mund ta pranojë pa u tendosur.'
 WHERE id = '5ed09abb-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- 30 ditë disipline · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 30-ditore për qëndrueshmërinë. Nuk kërkon vullnet më të fortë, por e ul pragun: një veprim i vogël i përsëritur në të njëjtën orë. Seanca përgatit mendjen për atë hap dhe e mbyll ditën duke e njohur atë që u bë.'
 WHERE id = '5ed09b09-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- 40 ditë transformimi · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 40-ditore, cikli i gjatë i riprogramimit. Dyzet ditë rresht mbi të njëjtën temë, sepse bindjet e vjetra nuk lëshojnë brenda javës. Struktura mbetet e njëjtë çdo ditë; ajo që ndryshon është sa lehtë e pranon trupi fjalinë e re.'
 WHERE id = '5ed09c39-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- 7 ditë gjumë · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 7-ditore për gjumin. Seanca dëgjohet në shtrat, me dritat e fikura: trupi rëndohet nga këmbët lart, fryma zgjatet, dhe mendimet e ditës lihen mënjanë pa u zgjidhur. Nuk ka mbyllje të zhurmshme — zëri shuhet ngadalë.'
 WHERE id = '5ed09b61-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- 7 ditë kundër ankthit · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Sfidë 7-ditore kundër ankthit. Çdo ditë punon me një pjesë tjetër të tij: ndjesinë në trup, mendimin që e ushqen, frikën nga e ardhmja. Në fund të javës ankthi nuk zhduket me urdhër, por humbet pjesën më të madhe të fuqisë.'
 WHERE id = '5ed09a23-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Aktivizo autoritetin · Vetëbesim
UPDATE meditations SET description = 'Riprogramim i mënyrës si e mban veten kur duhet të vendosësh. Punon me bindjen se autoriteti u takon të tjerëve: e kthen atë në një qëndrim të qetë, që nuk ka nevojë të ngrejë zërin për t''u dëgjuar.'
 WHERE id = '5ec89d2c-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Aktivizo liderin · Vetëbesim
UPDATE meditations SET description = 'Për atë që udhëheq të tjerët. Seanca punon me frikën e gabimit dhe nevojën për miratim — dy gjërat që e bëjnë udhëheqjen të lodhshme — dhe i zëvendëson me qartësi: vendos, komunikon, mban përgjegjësi.'
 WHERE id = '5ec89cf2-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Çliro frikën · Emocionet
UPDATE meditations SET description = 'Punon me frikën si ndjesi, jo si ide. E gjen aty ku rri te trupi, e lë të jetë pa e shtyrë, dhe pastaj e zbut me frymë dhe me fjali të reja. Në fund frika nuk komandon më zgjedhjet e ditës.'
 WHERE id = '5ec896d7-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dil nga paniku · Emocionet
UPDATE meditations SET description = 'Për çastin kur paniku po ngrihet. Seanca e ndal ciklin në pikën ku mendimi dhe trupi ushqejnë njëri-tjetrin: fryma ngadalësohet e para, pastaj vëmendja kthehet te dy-tre gjëra të prekshme rreth teje.'
 WHERE id = '5ec89463-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kapërce zilinë · Emocionet
UPDATE meditations SET description = 'Zilia tregohet këtu si shenjë, jo si faj. Seanca e lexon atë që të mungon nën të, e liron krahasimin me tjetrin, dhe e kthen vëmendjen te rruga jote — pa e mohuar ndjesinë dhe pa e mbajtur fshehur.'
 WHERE id = '5ec89656-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Largo fajin · Emocionet
UPDATE meditations SET description = 'Për fajin që mbetet edhe kur çështja ka mbaruar. Seanca ndan atë që ishte vërtet përgjegjësia jote nga ajo që more mbi vete pa të takuar, dhe e mbyll me një fjali që lejon të ecësh përpara.'
 WHERE id = '5ec895c4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Largo turpin · Emocionet
UPDATE meditations SET description = 'Turpi punohet butë, sepse ai fshihet kur e godet. Seanca e nxjerr nga errësira ngadalë, e emërton pa e zmadhuar, dhe e zëvendëson bindjen ''ka diçka të gabuar tek unë'' me një të vërtetë më të thjeshtë.'
 WHERE id = '5ec89616-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Liro ankthin në 10 minuta · Emocionet
UPDATE meditations SET description = 'Dhjetë minuta të ndërtuara për një ankth që ka nisur tashmë. Fryma shkurton ciklin e alarmit, trupi lirohet zonë pas zone, dhe mendimi që e mbante ndezur humbet mbështetjen. Mund të dëgjohet edhe ulur, në çdo vend.'
 WHERE id = '5ec88e78-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Liro mërzinë · Emocionet
UPDATE meditations SET description = 'Për mërzinë që rri pa shkak të dukshëm. Seanca nuk e shtyn me forcë të jetë gëzim: e pranon rëndesën, e lë të rrjedhë, dhe hap ngadalë hapësirë për diçka tjetër pranë saj.'
 WHERE id = '5ec89750-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Liro xhelozinë · Emocionet
UPDATE meditations SET description = 'Xhelozia trajtohet si frikë humbjeje, jo si e metë karakteri. Seanca e qetëson alarmin në trup, e ndan tregimin nga fakti, dhe e kthen sigurinë atje ku qëndron vërtet — te vetja.'
 WHERE id = '5ec89692-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ndërprit mbingarkesën emocionale · Emocionet
UPDATE meditations SET description = 'Për ditët kur gjithçka ndihet shumë njëherësh. Seanca e ndal rrjedhën: një gjë në një kohë, fryma e parë, trupi i dytë, lista e tretë. Mbingarkesa nuk zgjidhet duke menduar më shpejt, por duke ngadalësuar.'
 WHERE id = '5ec89811-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para kamerës · Vetëbesim
UPDATE meditations SET description = 'Përgatitje për të folur para kamerës. Punon me vetëdijen e tepruar për veten — zërin, fytyrën, gabimin e mundshëm — dhe e kthen vëmendjen te mesazhi dhe te njeriu që do ta dëgjojë.'
 WHERE id = '5ec89be5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para negociatave · Vetëbesim
UPDATE meditations SET description = 'Para negociatave. Seanca ul nevojën për të fituar me çdo kusht dhe frikën për të humbur marrëveshjen; të lë me një mendje të qetë, që dëgjon, pret dhe flet kur duhet.'
 WHERE id = '5ec89c72-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para një fjalimi · Vetëbesim
UPDATE meditations SET description = 'Për minutat para se të dalësh para publikut. Trupi qetësohet i pari, sepse zëri varet nga ai; pastaj provohet me mendje hyrja e parë, dhe vëmendja kalon nga ''si do të dukem'' te ''çfarë dua të them''.'
 WHERE id = '5ec89ba0-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para një interviste · Vetëbesim
UPDATE meditations SET description = 'Përgatitje për intervistë pune. Punon me frikën e vlerësimit dhe me zërin që zvogëlon përvojën tënde, dhe të lë me një qetësi të cilën bashkëbiseduesi e ndjen para se ti të flasësh.'
 WHERE id = '5ec89afa-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para një prezantimi · Vetëbesim
UPDATE meditations SET description = 'Para një prezantimi. Seanca e kthen emocionin nga ankth në gatishmëri: fryma zgjatet, duart lirohen, dhe fillimi provohet me mendje derisa të mos duket më i panjohur.'
 WHERE id = '5ec89b4e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para një takimi biznesi · Vetëbesim
UPDATE meditations SET description = 'Për takimet ku vendoset diçka. Punon me tundimin për të mbushur heshtjet dhe me frikën për të kërkuar atë që të takon; të lë të qetë, të përqendruar te qëllimi me të cilin hyre.'
 WHERE id = '5ec89c2a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Përballo pasigurinë · Emocionet
UPDATE meditations SET description = 'Për kohërat pa përgjigje. Seanca nuk premton siguri të rreme: mëson ta mbash pasigurinë pa u ngurtësuar, dhe e liron nevojën për ta ditur gjithçka para se të bësh hapin tjetër.'
 WHERE id = '5ec89714-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Qetëso mendimet obsesive · Emocionet
UPDATE meditations SET description = 'Për mendimet që kthehen në rreth. Seanca e prish ciklin duke e lëvizur vëmendjen nga koka te trupi, pastaj punon me bindjen se mendimi duhet ndjekur sa herë shfaqet.'
 WHERE id = '5ec8978b-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Qetëso zemërimin · Emocionet
UPDATE meditations SET description = 'Zemërimi këtu nuk mohohet — lexohet. Seanca e lë energjinë të ulet në trup, gjen kufirin që u shkel nën të, dhe e kthen atë në fjalë të qeta që mund t''i thuash nesër.'
 WHERE id = '5ec894f8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Rikthe shpresën · Emocionet
UPDATE meditations SET description = 'Për kohën pas një humbjeje ose pas një periudhe të gjatë të rëndë. Seanca nuk kërkon optimizëm: rikthen ngadalë ndjesinë se diçka e mirë është ende e mundshme, duke nisur nga gjërat e vogla.'
 WHERE id = '5ec897cf-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Rrit karizmën · Vetëbesim
UPDATE meditations SET description = 'Karizma trajtohet si prani, jo si teknikë. Seanca punon me tërheqjen e vëmendjes te vetja dhe e kthen atë nga jashtë-brenda: dëgjimi, ngadalësimi, dhe siguria që nuk ka nevojë të shfaqet.'
 WHERE id = '5ec89caf-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Shkrij trishtimin · Emocionet
UPDATE meditations SET description = 'Për trishtimin që ka ngrirë. Seanca e ngroh ngadalë — frymë, prekje e butë e vëmendjes, lot nëse vijnë — dhe e lë të lëvizë, sepse ajo që lëviz kalon.'
 WHERE id = '5ec8954e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Meditime për Trupin (34) ───────────────

-- 3 minuta energji · Mëngjes
UPDATE meditations SET description = 'Tre minuta për ta zgjuar trupin pa kafe. Fryma shkurtohet e thellohet, shpatullat dhe qafa lirohen, dhe gjymtyrët aktivizohen me lëvizje të vogla. Bëhet ende në shtrat ose në këmbë, para se të nisë dita.'
 WHERE id = '5ecde47e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Aktivizo zemrën · Mëngjes
UPDATE meditations SET description = 'Nis ditën nga kraharori, jo nga lista e detyrave. Tre minuta frymë në zonën e zemrës, me një kujtim të ngrohtë dhe një fjali mirënjohjeje — sa duhet që dita të nisë me ton tjetër.'
 WHERE id = '5ecde515-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankthi · Fëmijët 8–12
UPDATE meditations SET description = 'Për fëmijë 8–12 vjeç, kur barku ngushtohet nga shqetësimi. Me gjuhë të thjeshtë: ku e ndjen ankthin, si e fryn tullumbacen me frymë, dhe si kthehesh te gjërat që i sheh e i prek rreth teje.'
 WHERE id = '5ed09843-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Energjia e mëngjesit · Energji e lartë
UPDATE meditations SET description = 'Meditim trupor i mëngjesit. Skanim i shpejtë nga koka te këmbët, lirim i pjesëve që fjetën të ngrira, dhe frymë që rrit ritmin ngadalë — energji nga qarkullimi, jo nga nxitimi.'
 WHERE id = '5ecaed4e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Fli shpejt · Gjumi
UPDATE meditations SET description = 'Për ata që rrotullohen gjatë në shtrat. Trupi rëndohet zonë pas zone, fryma zgjatet te nxjerrja, dhe vëmendja shkëputet nga plani i nesërm. Zëri ngadalësohet dhe shuhet vetë, që të mos të zgjojë në fund.'
 WHERE id = '5ec8a03b-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Gjumi i thellë · Gjumi
UPDATE meditations SET description = 'Për një gjumë që zgjat, jo vetëm për ta zënë atë. Relaksim i thellë muskulor, frymë e ngadaltë dhe heqje e vëmendjes nga zhurma e brendshme — trupi kalon në gjendjen ku gjumi thellohet vetë.'
 WHERE id = '5ec8a07a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kur je i stresuar · Për situata të veçanta
UPDATE meditations SET description = 'Pesë minuta në mes të punës, kur stresi është mbledhur te shpatullat dhe nofulla. Lirim i shpejtë i atyre dy zonave, frymë me nxjerrje të gjatë, dhe kthim te detyra me trup më të butë.'
 WHERE id = '5ecde6ca-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kur nuk ke fokus · Për situata të veçanta
UPDATE meditations SET description = 'Për mendjen që hidhet nga një gjë te tjetra. Pesë minuta që e kthejnë vëmendjen te trupi — këmbët në dysheme, duart mbi tavolinë, tri fryma të numëruara — para se të kthehesh te puna.'
 WHERE id = '5ecde708-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditime familjare · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Meditim i shkurtër për ta bërë bashkë familjen. Të gjithë ulen, dëgjojnë të njëjtin zë dhe marrin frymë njësoj; pastaj një fjalë e vetme nga secili për ditën. Punon edhe me fëmijë, edhe me të rritur.'
 WHERE id = '5ed099cc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Menaxhimi i emocioneve · Fëmijët 8–12
UPDATE meditations SET description = 'Për fëmijë 8–12 vjeç. Emocionet shpjegohen si moti që kalon: mësohet si të njihet zemërimi apo trishtimi te trupi, dhe çfarë mund të bëhet me ta pa i mbajtur brenda dhe pa i hedhur mbi të tjerët.'
 WHERE id = '5ed09985-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Mirënjohja · Fëmijët 8–12
UPDATE meditations SET description = 'Për fëmijë 8–12 vjeç. Tre gjëra të vogla të ditës që shkuan mirë, njëra pas tjetrës, me frymë mes tyre. Praktikë e thjeshtë që e kthen vëmendjen nga ajo që mungoi te ajo që pati.'
 WHERE id = '5ed0992e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ndjehu i lehtë · Energji e lartë
UPDATE meditations SET description = 'Për rëndesën pas një dite të gjatë. Lirim i zonave ku mbahet pesha — nofulla, shpatullat, legeni — dhe frymë që e heq ndjesinë e ngarkesës nga trupi, jo vetëm nga mendja.'
 WHERE id = '5ecaeefc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Në trafik · Për situata të veçanta
UPDATE meditations SET description = 'Bëhet me sy hapur, në timon, në një kolonë që nuk lëviz. Duart lirohen mbi timon, shpatullat zbresin, nxjerrja zgjatet — pa mbyllur sytë dhe pa hequr vëmendjen nga rruga.'
 WHERE id = '5ecde563-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para darkës · Mbrëmje
UPDATE meditations SET description = 'Pesë minuta para se të ulesh në tryezë. Trupi kalon nga ritmi i punës në atë të shtëpisë: fryma ngadalësohet, barku lirohet, dhe ushqimi merret me vëmendje e jo me telefonin në dorë.'
 WHERE id = '5ecde7f0-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para gjumit · Mbrëmje
UPDATE meditations SET description = 'Rituali i shkurtër i mbrëmjes. Trupi lëshohet zonë pas zone, dita mbyllet me një fjali, dhe mendimet për nesër lihen jashtë dhomës. Pesë minuta që e përgatitin gjumin para se të shtrihesh.'
 WHERE id = '5ecde7a2-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para gjumit · Fëmijët 8–12
UPDATE meditations SET description = 'Për fëmijë 8–12 vjeç, pikërisht para gjumit. Me zë të ngadaltë: trupi bëhet i rëndë si rëra, fryma numërohet, dhe një skenë e qetë e shoqëron fëmijën derisa i mbyllen sytë.'
 WHERE id = '5ed097f2-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para mbledhjes · Për situata të veçanta
UPDATE meditations SET description = 'Pesë minuta para se të hysh në mbledhje. Fryma qetësohet, qëllimi yt për atë takim thuhet me një fjali, dhe vëmendja kalon nga ''si do të më shohin'' te ''çfarë dua të arrij këtu''.'
 WHERE id = '5ecde63c-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para punës · Për situata të veçanta
UPDATE meditations SET description = 'Bëhet në makinë, para se të ndezësh motorin. Tri fryma të thella, shpatullat poshtë, dhe një qëllim i vetëm për ditën — që të mos nisësh punën me nxitimin e rrugës mbi supe.'
 WHERE id = '5ecde5ae-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas debatit · Mbrëmje
UPDATE meditations SET description = 'Pas një debati, kur trupi është ende i ngrohtë. Pesë minuta që e ulin alarmin: nxjerrje e gjatë, duar të lirshme, dhe hapësirë mes asaj që ndodhi dhe asaj që do të thuash më pas.'
 WHERE id = '5ecde759-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas lajmit të keq · Mbrëmje
UPDATE meditations SET description = 'Për minutat pas një lajmi që të hoqi tokën nga këmbët. Nuk kërkon të kuptosh apo të vendosësh asgjë: vetëm frymë, mbështetje në trup dhe kthim i ngadaltë te dhoma ku ndodhesh.'
 WHERE id = '5ecde834-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas mbledhjes · Për situata të veçanta
UPDATE meditations SET description = 'Pas një mbledhjeje të rëndë. Lirim i tensionit që mbeti te qafa dhe duart, mbyllje e bisedës në mendje, dhe kthim i qetë te puna që kishe lënë përgjysmë.'
 WHERE id = '5ecde681-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas pagjumësisë · Gjumi
UPDATE meditations SET description = 'Për ditën pas një nate pa gjumë. Nuk e zëvendëson gjumin, por e ul lodhjen: relaksim i thellë i shkurtër, frymë që sjell energji pa i shtuar ankthin trupit të rraskapitur.'
 WHERE id = '5ec8a0c1-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas punës · Energji e lartë
UPDATE meditations SET description = 'Meditim trupor për kalimin nga puna te vetja. Rroba të ndërruara, shpatulla të ulura, dhjetë minuta frymë — që mbrëmja të mos jetë vazhdim i turnit, por diçka tjetër.'
 WHERE id = '5ecaee04-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas punës · Për situata të veçanta
UPDATE meditations SET description = 'Bëhet në makinë, para se të nisesh për në shtëpi. Pesë minuta që e lënë ditën e punës aty ku ishte: një skanim i shpejtë i trupit dhe një frymë që e mbyll turnin.'
 WHERE id = '5ecde5f8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas stresit · Energji e lartë
UPDATE meditations SET description = 'Pas një periudhe të tendosur, kur trupi ka mbetur në alarm. Lirim gradual i zonave që u mbajtën gjatë të shtrënguara dhe frymë e ngadaltë, që sistemi nervor të kuptojë se rreziku kaloi.'
 WHERE id = '5ecaee84-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas udhëtimit · Energji e lartë
UPDATE meditations SET description = 'Pas rrugës së gjatë me makinë, avion ose autobus. Trupi zgjatet e lirohet, këmbët tokëzohen, dhe fryma rregullon ritmin që udhëtimi e prishi.'
 WHERE id = '5ecaee44-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas zgjimit natën · Gjumi
UPDATE meditations SET description = 'Për zgjimin në orën tre të natës. Nuk kërkon të rifillosh gjumin me forcë: qetëson zhgënjimin që e mban zgjuar, e rëndon trupin sërish, dhe e lë gjumin të kthehet vetë.'
 WHERE id = '5ec8a106-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pasdite pa lodhje · Energji e lartë
UPDATE meditations SET description = 'Për rënien e pasdites. Frymë aktivizuese, lëvizje të vogla të qafës e shpatullave, dhe kthim i vëmendjes — energji pa kafe të dytë dhe pa e prishur gjumin e natës.'
 WHERE id = '5ecaed9f-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Përqendrimi · Fëmijët 8–12
UPDATE meditations SET description = 'Për fëmijë 8–12 vjeç, para mësimeve ose detyrave. Një lojë e shkurtër vëmendjeje: dëgjo tri tinguj, ndje dy prekje, merr një frymë — dhe mendja kthehet te faqja përpara.'
 WHERE id = '5ed098dd-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Rikthe ritmin cirkadian · Gjumi
UPDATE meditations SET description = 'Për atë që i ka orët e përmbysura. Punon me sinjalet që e rregullojnë ritmin ditë-natë: drita, ushqimi, koha e shtratit, dhe një relaksim që e ul trupin në orën e duhur.'
 WHERE id = '5ec8a152-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Rimbush energjinë · Energji e lartë
UPDATE meditations SET description = 'Kur bateria është në fund, por dita nuk ka mbaruar. Dhjetë minuta relaksimi të thellë me frymë të barazuar — pushim që rikthen energji, jo gjumë i ndërprerë.'
 WHERE id = '5ecaeec0-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vendos qëllimin · Mëngjes
UPDATE meditations SET description = 'Tre minuta për ta nisur ditën me drejtim. Një pyetje e vetme — çfarë ka rëndësi sot — dhe një qëllim i thënë qartë, i mbajtur me frymë derisa të ulet në trup.'
 WHERE id = '5ecde4cd-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vetëbesimi · Fëmijët 8–12
UPDATE meditations SET description = 'Për fëmijë 8–12 vjeç. Qëndrimi i trupit ndryshon si ndihet: shpatullat hapen, hapi bëhet i sigurt, dhe një fjali e thjeshtë përsëritet derisa fëmija ta besojë vetë.'
 WHERE id = '5ed0988f-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Zgjohu me energji · Gjumi
UPDATE meditations SET description = 'Për zgjimin e rëndë. Dhjetë minuta që e ndezin trupin ngadalë — frymë me ritëm në rritje, lëvizje të vogla, dritë — që të mos ngrihesh nga shtrati me shkelm.'
 WHERE id = '5ec8a193-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Meditime për Zemrën (18) ───────────────

-- Adoleshentët · Adoleshentët
UPDATE meditations SET description = 'Për moshën kur gjithçka ndihet e madhe. Punon me krahasimin, presionin e grupit dhe zërin e rreptë ndaj vetes, me gjuhë që nuk u flet nga lart adoleshentëve.'
 WHERE id = '5ecfb1d8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Aktivizo dhembshurinë · Zemra plot
UPDATE meditations SET description = 'Dhembshuria ushtrohet si muskul. Seanca nis nga dikush që e do lehtë, kalon te vetja — pjesa më e vështirë — dhe mbyllet me dikë me të cilin je në grindje.'
 WHERE id = '5ec898b3-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Çifti · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Meditim për dy vetë që jetojnë bashkë. Punon me mërzitë e vogla që mblidhen pa u thënë, dhe e rikthen vëmendjen te ajo që të solli këtu. Mund të dëgjohet edhe së bashku.'
 WHERE id = '5ecfb137-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Fal dikë · Falja
UPDATE meditations SET description = 'Falja këtu nuk do të thotë ta quash të drejtë atë që ndodhi. Seanca e liron peshën që mban ti, ngadalë dhe pa e detyruar, dhe e lë vendimin për marrëdhënien krejt te ti.'
 WHERE id = '5ec89944-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Fal veten · Falja
UPDATE meditations SET description = 'Për fajin që e mban ndaj vetes. Seanca e sheh gabimin ashtu siç ishte — pa e zmadhuar dhe pa e fshehur — dhe pastaj i flet vetes ashtu si do t''i flisje një miku në të njëjtin vend.'
 WHERE id = '5ec898fd-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Falja · Falja
UPDATE meditations SET description = 'Praktikë e gjerë e faljes, për këdo që mban diçka të pashlyer. Punon me atë që mbetet te trupi kur ngjarja ka kaluar prej kohësh, dhe e lë peshën të ulet një shkallë më poshtë.'
 WHERE id = '5ecfb375-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Hap zemrën · Zemra plot
UPDATE meditations SET description = 'Për kraharorin që rri i mbyllur pas një lëndimi. Fryma çohet drejt zemrës, mbrojtja njihet e falënderohet, dhe hapja bëhet me ritmin tënd — pa e detyruar askënd të besojë sërish sot.'
 WHERE id = '5ec89868-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Intimiteti · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Intimiteti trajtohet si siguri, jo si teknikë. Seanca punon me turpin, me largësinë që krijohet pa u vënë re, dhe me kthimin e prekjes e të fjalës mes dy njerëzve.'
 WHERE id = '5ecfb226-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Komunikimi · Dashuria ndaj vetes
UPDATE meditations SET description = 'Për bisedat që nisin keq. Seanca të mëson ta dëgjosh tjetrin pa përgatitur përgjigjen, dhe ta thuash atë që ke nevojë me fjalë që nuk godasin.'
 WHERE id = '5ecfb327-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kufijtë · Dashuria ndaj vetes
UPDATE meditations SET description = 'Kufijtë si kujdes, jo si mur. Punon me fajin që vjen pas një ''jo''-je dhe me frikën e humbjes së lidhjes, dhe të lë me fjali të qarta e të buta për herën tjetër.'
 WHERE id = '5ecfb2dc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Liro dhimbjen e tradhtisë · Zemra plot
UPDATE meditations SET description = 'Për besimin e thyer. Seanca e mban dhimbjen pa e mbytur: e lë zemërimin të flasë, pastaj e liron ngadalë atë që ti mban në trup për një gabim që nuk ishte yti.'
 WHERE id = '5ec8998f-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditim për marrëdhënien në çift · Zemra plot
UPDATE meditations SET description = 'Meditim për çiftin që do të ecë përpara. Punon me pritshmëritë e pathëna, me durimin që mbaroi, dhe me zgjedhjen e përditshme që një lidhje kërkon.'
 WHERE id = '5ec89aab-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Miqësia · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Për miqësitë që janë ftohur ose janë bërë të njëanshme. Seanca sheh çfarë jep e çfarë merr, dhe hap vend për afërsinë pa detyrim.'
 WHERE id = '5ecfb280-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ndje dashurinë pa kushte · Zemra plot
UPDATE meditations SET description = 'Dashuria pa kushte ushtrohet së pari ndaj vetes. Seanca heq ngadalë kushtet që i ke vënë vlerës sate — arritjet, pamja, miratimi — dhe e lë ndjesinë të rrijë pa asnjërin prej tyre.'
 WHERE id = '5ec89a6b-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Prindërimi · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Për prindërit, në fund të një dite të vështirë. Punon me fajin, me durimin që mbaroi, dhe me atë që fëmija merr vërtet — praninë tënde, jo përsosmërinë.'
 WHERE id = '5ecfb184-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Rikthe besimin · Zemra plot
UPDATE meditations SET description = 'Për besimin që u lëkund. Seanca e ndan të kaluarën nga i tanishmi, e njeh kujdesin që të mbron, dhe rikthen ngadalë gatishmërinë për t''u mbështetur te dikush.'
 WHERE id = '5ec89a29-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Shëro ndarjen · Zemra plot
UPDATE meditations SET description = 'Për kohën pas një ndarjeje. Seanca e lë mallin të jetë aty pa u kthyer në vetë-faj, e ndan njeriun nga zakoni i tij, dhe e kthen vëmendjen te jeta që po rifillon.'
 WHERE id = '5ec899d6-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vetmia · Dashuria ndaj vetes
UPDATE meditations SET description = 'Vetmia nuk mbushet me zhurmë. Seanca e njeh atë pa u trembur, gjen shoqërinë e parë te vetja, dhe zbut ndjesinë se je lënë jashtë.'
 WHERE id = '5ecfb3bf-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Teknika Energjetike (14) ───────────────

-- Aktivizo bollëkun · Zemra plot
UPDATE meditations SET description = 'Punë energjetike me hapjen ndaj marrjes. Vëmendja shkon te qendra e barkut e zemrës, lirohet ndjesia e mungesës, dhe vizualizohet një rrjedhë që hyn — jo vetëm që del.'
 WHERE id = '5eccfe55-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Aktivizo intuitën · Intuita
UPDATE meditations SET description = 'Aktivizim i qendrës mes vetullave. Seanca qetëson zhurmën mendore që e mbulon intuitën, dhe pastaj ushtron dallimin mes një sinjali të qetë dhe një frike të zhurmshme.'
 WHERE id = '5eccfe10-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Balanco chakrat · Zemra plot
UPDATE meditations SET description = 'Kalim nga poshtë lart nëpër shtatë qendrat energjetike. Në secilën ndalet pak: vëmendje, ngjyrë, frymë, dhe lirim i asaj që rri e ngjeshur atje.'
 WHERE id = '5eccfe9d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Hap zemrën · Zemra plot
UPDATE meditations SET description = 'Hapje energjetike e zonës së kraharorit. Dritë e ngrohtë në qendër të gjoksit, frymë që e zgjeron, dhe lirim i ngurtësisë që mbetet aty pas kohëve të vështira.'
 WHERE id = '5eccfdc8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kthe energjinë tek vetja · Qetësim
UPDATE meditations SET description = 'Për ata që japin shumë dhe mbeten bosh. Seanca e mbledh vëmendjen dhe energjinë e shpërndarë te njerëzit e situatat e ditës, dhe e kthen brenda kufijve të tu.'
 WHERE id = '5eccfd3a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Liro lidhjet toksike · Qetësim
UPDATE meditations SET description = 'Për lidhjet që të lodhin edhe nga larg. Vizualizohen fijet që të mbajnë të lidhur me dikë, dhe pritet me butësi ajo që nuk të takon më — pa urrejtje dhe pa dramë.'
 WHERE id = '5eccfd80-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Mbrojtje energjitike · Qetësim
UPDATE meditations SET description = 'Mbrojtje energjetike për ditët mes shumë njerëzish. Ndërtohet një shtresë rreth trupit që lë të kalojë ngrohtësia dhe ndal atë që të rëndon, dhe mësohet si ta rivendosësh shpejt.'
 WHERE id = '5eccfcf6-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Mbush aurën · Qetësim
UPDATE meditations SET description = 'Mbushje e fushës rreth trupit pas një dite që të zbrazi. Dritë që hyn me çdo frymëmarrje dhe mbush vrimat e lodhjes, deri te ndjesia se je sërish i plotë.'
 WHERE id = '5eccfc68-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pastro aurën · Qetësim
UPDATE meditations SET description = 'Pastrim i aurës pas kontaktit me shumë njerëz. Vizualizim i një rryme që kalon nga koka te këmbët dhe merr me vete atë që nuk është jotja.'
 WHERE id = '5eccfcac-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Praktika me duar · Bollëku
UPDATE meditations SET description = 'Praktikë me duart, ku ndjesia bëhet e prekshme. Duart ngrohen, mbahen mbi zonat që kërkojnë kujdes, dhe vëmendja ndjek nxehtësinë e rrjedhën nën pëllëmbë.'
 WHERE id = '5eccffa9-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Qendra e trupit · Bollëku
UPDATE meditations SET description = 'Punë me qendrën e trupit, dy gishta nën kërthizë. Fryma zbret aty, vëmendja rri gjatë, dhe stabiliteti ndërtohet nga poshtë lart — bazë për çdo praktikë tjetër.'
 WHERE id = '5eccff26-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Rrit vibracionin · Bollëku
UPDATE meditations SET description = 'Ngritje e gjendjes së brendshme me frymë, zë dhe kujtim. Seanca nis nga aty ku je, pa kërkuar hov të rremë, dhe e ngre tonin një shkallë në një kohë.'
 WHERE id = '5eccff67-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Tokëzim · Bollëku
UPDATE meditations SET description = 'Tokëzim: lidhje e trupit me tokën poshtë. Këmbët rëndohen, rrënjët zbresin me imagjinatë, dhe ankthi që rri lart te gjoksi gjen ku të shkarkohet.'
 WHERE id = '5eccfee4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vetë-shërim energjetik · Bollëku
UPDATE meditations SET description = 'Vetë-shërim energjetik. Vëmendja çohet te zona që kërkon kujdes, mbahet aty pa nxitim, dhe shoqërohet me frymë e dritë. Praktikë shoqëruese — nuk zëvendëson trajtimin mjekësor.'
 WHERE id = '5eccffea-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Frymëmarrje (33) ───────────────

-- Aktivizo motivimin · Energji e lartë
UPDATE meditations SET description = 'Frymëmarrje aktivizuese për ditët kur nuk nisesh dot. Cikle të shkurtra e të gjalla, me thithje më të fortë se nxjerrja, që e ngrenë ritmin e zemrës dhe e hapin kraharorin.'
 WHERE id = '5ecc149e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankth akut · Emergjencë
UPDATE meditations SET description = 'Për ankthin që ka arritur kulmin. Fryma udhëhiqet hap pas hapi, me nxjerrje dy herë më të gjatë se thithja, derisa alarmi të ulet. Zëri rri pranë gjatë gjithë kohës dhe nuk të lë vetëm.'
 WHERE id = '5ecde923-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Box breathing · Shëndeti
UPDATE meditations SET description = 'Box breathing — katër numra thithje, katër mbajtje, katër nxjerrje, katër mbajtje. Ritëm i barabartë që e qetëson sistemin nervor dhe e mban mendjen të zënë me numërimin, jo me shqetësimin.'
 WHERE id = '5ecc1a98-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Coherence breathing · Shëndeti
UPDATE meditations SET description = 'Coherence breathing — rreth pesë frymëmarrje në minutë, thithje dhe nxjerrje të njëjta. Ritmi ku zemra dhe fryma hyjnë në të njëjtin valë; praktikë bazë për ditët e ngarkuara.'
 WHERE id = '5ecc1a59-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Energji në mëngjes · Energji e lartë
UPDATE meditations SET description = 'Frymëmarrje për të zgjuar trupin. Cikle që rritin ngadalë thellësinë, me lëvizje të vogla të kraharorit — mëngjes i ndezur pa nxitim dhe pa kafe të dytë.'
 WHERE id = '5ecc1459-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Fokus · Fokus dhe performancë
UPDATE meditations SET description = 'Frymë për vëmendje të qëndrueshme. Ritëm i barabartë me numërim, që e mban mendjen te një gjë e vetme dhe e kthen aty sa herë ikën. Bëhet para punës që kërkon thellësi.'
 WHERE id = '5ecc16e4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frikë · Emergjencë
UPDATE meditations SET description = 'Për frikën që të kapi papritur. Fryma udhëhiqet ngadalë derisa duart të lirohen, dhe pastaj vëmendja kthehet te ajo që sheh e prek rreth teje — provë se çasti është i sigurt.'
 WHERE id = '5ecdea19-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frymëmarrje diafragmatike · Shëndeti
UPDATE meditations SET description = 'Frymëmarrje diafragmatike — fryma zbret te barku, jo te shpatullat. Mësohet me dorën mbi bark, dhe pastaj mbahet për disa minuta; baza e çdo teknike tjetër frymëmarrjeje.'
 WHERE id = '5ecc1a13-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frymëmarrje vagale · Shëndeti
UPDATE meditations SET description = 'Frymë që aktivizon nervin vag: nxjerrje e gjatë, ndonjëherë me zë ose me buzë të mbledhura. Sinjali më i drejtpërdrejtë që trupi e njeh si ''rreziku kaloi''.'
 WHERE id = '5ecc19cf-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Humbje · Emergjencë
UPDATE meditations SET description = 'Për humbjen e dikujt ose të diçkaje. Nuk kërkon të pajtohesh me atë që ndodhi: vetëm frymë që rri pranë dhimbjes, që ajo të mos të mbyllë gjoksin.'
 WHERE id = '5ecde9c5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kreativitet · Fokus dhe performancë
UPDATE meditations SET description = 'Frymë për mendjen që ka ngecur. Cikle të ngadalta që e ulin kontrollin dhe e hapin vëmendjen — gjendja ku zgjidhja shpesh vjen vetë, pa u kërkuar me forcë.'
 WHERE id = '5ecc1733-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Krizë emocionale · Emergjencë
UPDATE meditations SET description = 'Për çastin kur gjithçka del përnjëherë. Fryma udhëhiqet me zë të qetë derisa vala të kalojë; pa pyetje, pa zgjidhje, vetëm ritmi që kthehet dhe trupi që ulet.'
 WHERE id = '5ecdea5e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Lajm i keq · Emergjencë
UPDATE meditations SET description = 'Për minutat pas një lajmi të rëndë. Fryma mban trupin derisa tronditja ulet; asnjë vendim, asnjë plan, vetëm ritmi që kthehet.'
 WHERE id = '5ecde96f-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto bollëk · Manifestim
UPDATE meditations SET description = 'Frymë dhe qëllim për bollëkun. Fryma hap hapësirë te gjoksi, pastaj mbahet imazhi i asaj që kërkon derisa të ndihet i mundshëm në trup, jo vetëm në mendje.'
 WHERE id = '5ecc186a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto klientë · Manifestim
UPDATE meditations SET description = 'Për ata që sjellin klientë me punën e tyre. Fryma qetëson frikën e refuzimit, dhe qëllimi formulohet qartë: kujt i shërben, dhe si duket dita kur ata vijnë vetë.'
 WHERE id = '5ecc18f4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto partner · Manifestim
UPDATE meditations SET description = 'Frymë dhe imazh për një lidhje të re. Punon me nxitimin dhe frikën e mbetjes vetëm, dhe e kthen vëmendjen te cilësia që kërkon — jo te një fytyrë e caktuar.'
 WHERE id = '5ecc193a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto shëndet · Manifestim
UPDATE meditations SET description = 'Frymë dhe qëllim për shëndetin. Vëmendja çohet te trupi ashtu si është sot, dhe mbahet imazhi i tij i qetë e funksional. Praktikë shoqëruese — nuk zëvendëson trajtimin mjekësor.'
 WHERE id = '5ecc197e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto shtëpi · Manifestim
UPDATE meditations SET description = 'Frymë dhe imazh për shtëpinë. Ndërtohet me detaje — drita, dhomat, zëri brenda — dhe mbahet me frymë derisa ndjesia e ''shtëpisë'' të bëhet e njohur.'
 WHERE id = '5ecc18b0-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Në trafik · Stres
UPDATE meditations SET description = 'Frymë për t''u bërë në kolonë, me sy hapur. Duart lirohen mbi timon, nxjerrja zgjatet, dhe nxitimi i ditës ulet pa e hequr vëmendjen nga rruga.'
 WHERE id = '5ecc169a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Overthinking · Emergjencë
UPDATE meditations SET description = 'Për mendjen që nuk pushon së analizuari. Fryma me numërim e zë vendin e mendimit, dhe cikli i pafund ndalet aty ku nis — te trupi.'
 WHERE id = '5ecdeadd-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para negociatës · Fokus dhe performancë
UPDATE meditations SET description = 'Para negociatës. Fryma ul nevojën për të folur i pari dhe e mban zërin të qetë; ritmi i barabartë të lë kohë të dëgjosh çfarë thuhet vërtet.'
 WHERE id = '5ecc17bc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para palestrës · Energji e lartë
UPDATE meditations SET description = 'Frymë përgatitore para stërvitjes. Rrit oksigjenimin dhe ngre gatishmërinë pa e ngritur ankthin — trup i ngrohur nga brenda para lëvizjes së parë.'
 WHERE id = '5ecc14f5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para provimit · Fokus dhe performancë
UPDATE meditations SET description = 'Para provimit. Fryma e qetëson dridhjen e duarve dhe e kthen kujtesën në punë; teknikë e shkurtër që mund të përsëritet edhe ulur në karrige, para se të kthesh fletën.'
 WHERE id = '5ecc1779-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para punës · Energji e lartë
UPDATE meditations SET description = 'Dhjetë minuta frymë para se të nisësh punën. Ritmi ngjitet ngadalë, mendja rreshtohet te detyra e parë, dhe dita nuk nis me vrap.'
 WHERE id = '5ecc153d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para sportit · Fokus dhe performancë
UPDATE meditations SET description = 'Para sportit. Frymë që e ngre fokusin dhe e mbledh vëmendjen te trupi — ritmi, hapi, zgjatja — përpara se të nisë gara ose stërvitja.'
 WHERE id = '5ecc181d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas debatit · Stres
UPDATE meditations SET description = 'Pas një debati. Nxjerrje të gjata derisa zemra të ulet, dhe hapësirë mes asaj që u tha dhe asaj që do të thuash. Bëhet vetëm, para se të kthehesh te biseda.'
 WHERE id = '5ecc1659-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Për ankth · Stres
UPDATE meditations SET description = 'Frymë për ankthin e përditshëm. Cikle me nxjerrje më të gjatë se thithja, të përsëritura mjaftueshëm sa trupi të kalojë nga alarmi te qetësia.'
 WHERE id = '5ecc15d3-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Për panik · Stres
UPDATE meditations SET description = 'Për sulmin e panikut. Fryma udhëhiqet ngadalë dhe qartë, pa kërkuar asgjë tjetër nga ti; teknika e njëjtë mund të përsëritet sa herë vala kthehet.'
 WHERE id = '5ecc158c-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Për stres · Stres
UPDATE meditations SET description = 'Frymë kundër stresit të mbledhur. Ritëm i barabartë, shpatulla që ulen me çdo nxjerrje, dhe një pauzë e shkurtër që e ndan ditën më dysh.'
 WHERE id = '5ecc1612-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Resonant breathing · Shëndeti
UPDATE meditations SET description = 'Resonant breathing — rreth gjashtë frymëmarrje në minutë, ritmi ku trupi gjen ekuilibrin më të mirë mes qetësisë dhe vëmendjes. Mund të bëhet çdo ditë, edhe pa shkak.'
 WHERE id = '5ecc1adb-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Sulm paniku · Emergjencë
UPDATE meditations SET description = 'Për sulmin e panikut në çastin që po ndodh. Zëri të shoqëron hap pas hapi: fryma e para, pastaj trupi, pastaj dhoma rreth teje. Nuk kërkohet asgjë veç dëgjimit.'
 WHERE id = '5ecde886-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Të qara · Emergjencë
UPDATE meditations SET description = 'Kur të qarat vijnë pa ndalur. Fryma nuk i ndal — i shoqëron, që gjoksi të mos mbyllet dhe vala të kalojë deri në fund, siç duhet.'
 WHERE id = '5ecdea9e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Zemërim ekstrem · Emergjencë
UPDATE meditations SET description = 'Për zemërimin që ka arritur kulmin. Fryma e nxjerr presionin pa e hedhur mbi askënd: nxjerrje të forta e të gjata, derisa trupi të ulet dhe mendja të kthehet.'
 WHERE id = '5ecde8d6-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── EFT / Tapping (29) ───────────────

-- Ankth i përgjithshëm · Ankth/Panik/Fobi
UPDATE meditations SET description = 'Raund tapping-u për ankthin e përgjithshëm. Nis me matjen e intensitetit nga 0 në 10, vazhdon me trokitje mbi pikat e fytyrës e të trupit bashkë me fjalitë, dhe mbyllet duke e matur sërish.'
 WHERE id = '5ecaf349-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankth në trafik · Ankth/Panik/Fobi
UPDATE meditations SET description = 'Tapping për ankthin në timon. Bëhet i ndalur, para ose pas rrugës — kurrë duke ngarë. Punon me ngushticën në gjoks dhe me mendimet për aksidentin, raund pas raundi.'
 WHERE id = '5ecaf49d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankth para fluturimit · Ankth/Panik/Fobi
UPDATE meditations SET description = 'Tapping para fluturimit. Punon me ndjesinë e mungesës së kontrollit dhe me turbulencën e imagjinuar; mund të bëhet edhe në ulëse, me trokitje të lehta dhe fjali të thëna në heshtje.'
 WHERE id = '5ecaf38d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankth para gjumit · Ankth/Panik/Fobi
UPDATE meditations SET description = 'Tapping për ankthin që ngrihet sapo bie koka në jastëk. Raunde që e ulin ngarkesën e ditës dhe mendimin për të nesërmen, derisa trupi të lëshohet.'
 WHERE id = '5ecaf4e4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankth para prezantimit · Ankth/Panik/Fobi
UPDATE meditations SET description = 'Tapping para se të dalësh para të tjerëve. Punon me duart që dridhen, zërin që tundohet dhe frikën e gabimit, dhe e ul intensitetin para se të nisësh.'
 WHERE id = '5ecaf418-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankth para provimit · Ankth/Panik/Fobi
UPDATE meditations SET description = 'Tapping para provimit. Punon me bllokimin e kujtesës nën presion dhe me frikën e dështimit; raunde të shkurtra që mund të bëhen edhe në korridor.'
 WHERE id = '5ecaf3d5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ankth social · Ankth/Panik/Fobi
UPDATE meditations SET description = 'Tapping për ankthin mes njerëzve. Punon me ndjesinë se je nën vëzhgim dhe me frikën e gjykimit, dhe e zbut derisa prania e të tjerëve të mos ngushtojë më gjoksin.'
 WHERE id = '5ecaf45c-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dëshira për cigare · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Tapping për dëshirën e cigares. Bëhet pikërisht kur dëshira është aty: matet forca e saj, trokitet mbi pikat ndërsa emërtohet, dhe pritet derisa vala të ulet vetë.'
 WHERE id = '5ecc1346-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dëshira për sheqer · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Tapping për dëshirën e ëmbëlsirave. Punon me çastin mes impulsit dhe veprimit, dhe e zgjat atë hapësirë sa duhet që zgjedhja të jetë e jotja.'
 WHERE id = '5ecc1307-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dhimbje koke · Shëndeti
UPDATE meditations SET description = 'Tapping për dhimbjen e kokës me origjinë tensioni. Trokitje mbi pikat bashkë me vëmendje te zona që shtrëngon. Praktikë shoqëruese — nuk zëvendëson vlerësimin dhe trajtimin mjekësor.'
 WHERE id = '5ecc11cc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dhimbje qafe · Shëndeti
UPDATE meditations SET description = 'Tapping për tensionin te qafa. Punon me ngarkesën që mblidhet aty pas orëve para ekranit dhe pas ditëve të tendosura, me raunde të shkurtra dhe lëvizje të lehta.'
 WHERE id = '5ecc120a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dhimbje shpine · Shëndeti
UPDATE meditations SET description = 'Tapping për shpinën e ngarkuar. Ndjek zonën që dhemb, e emërton, dhe e shoqëron me fjali derisa shtrëngimi të lëshojë. Praktikë shoqëruese — nuk zëvendëson trajtimin mjekësor.'
 WHERE id = '5ecc124d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frika nga braktisja · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Tapping për frikën se do të mbetesh vetëm. Punon me ndjesinë e vjetër që zgjohet te çdo largim, edhe kur ai është i zakonshëm, dhe e ul derisa të mos komandojë sjelljen.'
 WHERE id = '5ecc1005-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frika nga çmimet e larta · Fokus dhe performancë
UPDATE meditations SET description = 'Tapping për frikën e çmimit që kërkon. Punon me bindjen se do të të refuzojnë ose se nuk e meriton shumën, dhe e zbut para bisedës me klientin.'
 WHERE id = '5ecc10c8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frika nga dështimi · Fokus dhe performancë
UPDATE meditations SET description = 'Tapping për frikën e dështimit. Punon me skenarin më të keq që e mban hapin pezull, dhe e ul mjaftueshëm sa të nisësh pa e pasur atë mbi sup.'
 WHERE id = '5ecc1146-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frika nga refuzimi · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Tapping për frikën e refuzimit në marrëdhënie. Punon me kujtimet e para ku u ndjeve i palënë brenda, dhe e ul ndjeshmërinë ndaj tyre.'
 WHERE id = '5ecc0fc7-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frika nga refuzimi · Fokus dhe performancë
UPDATE meditations SET description = 'Tapping për refuzimin në punë. Punon me ''jo''-në e klientit ose të bashkëpunëtorit — ta marrësh si informacion, jo si gjykim mbi vlerën tënde.'
 WHERE id = '5ecc108b-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frika nga suksesi · Fokus dhe performancë
UPDATE meditations SET description = 'Tapping për frikën e suksesit. Punon me atë që humbet kur rritesh — qetësia, njerëzit, anonimiteti — dhe me lejen për të pasur më shumë.'
 WHERE id = '5ecc1109-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Frika nga shitja · Fokus dhe performancë
UPDATE meditations SET description = 'Tapping për shitjen. Punon me ndjesinë se po imponon diçka, dhe e kthen bisedën nga bindja te shërbimi.'
 WHERE id = '5ecc104d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Migrenë · Shëndeti
UPDATE meditations SET description = 'Tapping për migrenën, si praktikë mbështetëse mes krizave. Punon me tensionin dhe ankthin që e shoqërojnë. Nuk zëvendëson kurrë trajtimin e mjekut.'
 WHERE id = '5ecc1289-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Overeating · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Tapping për ushqyerjen nga emocioni. Punon me çastin kur hapet frigoriferi pa uri, dhe me ndjesinë që kërkon të mbulohet me ushqim.'
 WHERE id = '5ecc1386-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Para një bisede të vështirë · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Tapping para një bisede të vështirë. Ul ankthin paraprijës dhe e qartëson atë që do të thuash, që të hysh pa u mbrojtur dhe pa sulmuar.'
 WHERE id = '5ecaf570-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas debatit · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Tapping pas debatit. Punon me ngarkesën që mbetet në trup dhe me fjalët që të vijnë ende në mendje, dhe e ul para se ta hedhësh sërish mbi tjetrin.'
 WHERE id = '5ecaf52d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pas tradhtisë · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Tapping pas tradhtisë. Punon me imazhet që kthehen pa u ftuar dhe me dyshimin ndaj vetes; raunde të buta, të përsëritura sa herë vala ngrihet.'
 WHERE id = '5ecc0f16-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Rrjetet sociale · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Tapping për rrjetet sociale. Punon me kërkimin e pandërprerë të pëlqimeve dhe me krahasimin që të lë bosh pas çdo lëvizjeje me gisht.'
 WHERE id = '5ecc1405-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Sindroma e mashtruesit · Fokus dhe performancë
UPDATE meditations SET description = 'Tapping për ndjesinë se je aty pa e merituar. Punon me frikën e zbulimit dhe me zhvlerësimin e arritjeve të tua, dhe e lidh vlerën me punën që ke bërë vërtet.'
 WHERE id = '5ecc118a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Telefoni · Tejkalim i varësive dhe zakoneve të vjetra
UPDATE meditations SET description = 'Tapping për varësinë nga telefoni. Punon me shtytjen për ta kontrolluar pa arsye, dhe e zgjat hapësirën mes impulsit dhe dorës.'
 WHERE id = '5ecc13c5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Tension muskulor · Shëndeti
UPDATE meditations SET description = 'Tapping për muskujt që nuk lëshojnë. Ndjek zonat e shtrënguara një nga një — nofulla, shpatullat, shpina — me trokitje dhe frymë mes raundeve.'
 WHERE id = '5ecc12c5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Xhelozia · Përmirësimi i marrëdhënieve
UPDATE meditations SET description = 'Tapping për xhelozinë. Punon me imazhet që i ndërton mendja dhe me frikën e humbjes nën to, pa i quajtur të vërteta dhe pa i mohuar.'
 WHERE id = '5ecc0f7a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Afirmime (14) ───────────────

-- Besim · Dashuria ndaj vetes
UPDATE meditations SET description = 'Afirmime për besimin te vetja. Fjalitë thuhen në vetën e parë dhe në kohën e tashme, me pauza mes tyre që t''i përsërisësh me zë ose në heshtje. Punojnë me përsëritjen, jo me bindjen e menjëhershme.'
 WHERE id = '5ecd0496-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Biznes · Energji e lartë
UPDATE meditations SET description = 'Afirmime për atë që drejton një biznes. Prekin vlerën e punës, çmimin, vendimet dhe të drejtën për të kërkuar. Dëgjohen në mëngjes ose para një bisede të rëndësishme.'
 WHERE id = '5ecd0532-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Bollëk · Dashuria ndaj vetes
UPDATE meditations SET description = 'Afirmime për bollëkun. Punojnë me marrëdhënien e vjetër me paranë — frikën, fajin, mosmeritimin — dhe e zëvendësojnë ngadalë me një ton tjetër.'
 WHERE id = '5ecd02f4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Burrat · Energji e lartë
UPDATE meditations SET description = 'Afirmime për burrat. Prekin lejen për të ndier, forcën që nuk ka nevojë ta provojë veten, dhe përgjegjësinë pa mbingarkesë.'
 WHERE id = '5ecd0628-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dashuri · Dashuria ndaj vetes
UPDATE meditations SET description = 'Afirmime për dashurinë — atë që jep dhe atë që lejon të marrësh. Fjalitë punojnë me hapjen pa u zhbërë dhe me pranimin e afërsisë.'
 WHERE id = '5ecd037e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Falje · Falja
UPDATE meditations SET description = 'Afirmime për faljen. Fjali të buta që e lëshojnë ngadalë peshën, pa e detyruar veten të harrojë dhe pa e quajtur të drejtë atë që ndodhi.'
 WHERE id = '5ecd044e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Fëmijët · Energji e lartë
UPDATE meditations SET description = 'Afirmime për fëmijët, me gjuhë të thjeshtë e të ngrohtë. Fjali të shkurtra që fëmija i përsërit lehtë — për sigurinë, mirësinë dhe vlerën e vet.'
 WHERE id = '5ecd0672-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Gratë · Energji e lartë
UPDATE meditations SET description = 'Afirmime për gratë. Prekin lodhjen nga dhënia pa fund, të drejtën për hapësirë, dhe marrëdhënien me trupin e me kohën e vet.'
 WHERE id = '5ecd05e5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Karrierë · Energji e lartë
UPDATE meditations SET description = 'Afirmime për rrugën profesionale. Fjali për qartësinë, guximin e hapit tjetër dhe vlerën që sjell ti, pa krahasim me askënd.'
 WHERE id = '5ecd059d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifestim · Dashuria ndaj vetes
UPDATE meditations SET description = 'Afirmime për manifestimin. Fjalitë e mbajnë qëllimin në kohën e tashme, që mendja të mos e shtyjë gjithmonë për nesër.'
 WHERE id = '5ecd0404-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Prindërim · Energji e lartë
UPDATE meditations SET description = 'Afirmime për prindërit. Prekin fajin, durimin që mbaron dhe lejen për të qenë njeri para se të jesh prind.'
 WHERE id = '5ecd04e1-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Studentët · Energji e lartë
UPDATE meditations SET description = 'Afirmime për studentët. Fjali për kujtesën, disiplinën e qetë dhe besimin para provimit — dëgjohen gjatë ditëve të mësimit.'
 WHERE id = '5ecd06b0-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Shëndet · Dashuria ndaj vetes
UPDATE meditations SET description = 'Afirmime për shëndetin dhe marrëdhënien me trupin. Fjali që ndërtojnë kujdes e durim ndaj tij. Praktikë shoqëruese — nuk zëvendëson trajtimin mjekësor.'
 WHERE id = '5ecd03c0-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vetëvlerësim · Dashuria ndaj vetes
UPDATE meditations SET description = 'Afirmime për vetëvlerësimin. Punojnë me zërin e brendshëm që zvogëlon çdo arritje, dhe e zëvendësojnë me një mënyrë tjetër të folurit ndaj vetes.'
 WHERE id = '5ecd0336-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Vizualizim (16) ───────────────

-- Biznesi ideal · Jeta ideale
UPDATE meditations SET description = 'Vizualizim i biznesit që do të ndërtosh. Ndërtohet me detaje — dita e punës, njerëzit, zëri që përdor — derisa drejtimi të bëhet i qartë dhe hapi tjetër i dukshëm.'
 WHERE id = '5ecd01da-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Dita perfekte · Jeta ideale
UPDATE meditations SET description = 'Vizualizim i një dite të përsosur, nga zgjimi te gjumi. Shërben si busull: ajo që shfaqet në të tregon çfarë ka rëndësi vërtet për ty.'
 WHERE id = '5ecd0154-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Fëmija i brendshëm · Vetja e së ardhmes
UPDATE meditations SET description = 'Takim me fëmijën që ke qenë. Seanca të çon te një skenë e hershme, dhe i jep atij fëmije atë që i mungoi atëherë — me fjalët e tua të sotme.'
 WHERE id = '5ecd00c4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditim për të gjetur rrugën më të lartë · Intuita
UPDATE meditations SET description = 'Vizualizim i udhëhequr për vendimet e mëdha. Mendja qetësohet, pastaj shfaqen rrugët e mundshme dhe ndiqet ajo që trupi e njeh si të vetën. Praktikë për t''u dëgjuar pa nxitim.'
 WHERE id = '73b9c201-ab5c-11f1-97ee-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditim për të lexuar librin e jetës · Intuita
UPDATE meditations SET description = 'Vizualizim i thellë me imazhin e një libri që mban historinë tënde. Faqet hapen vetë; ajo që lexohet aty vjen nga brenda, jo nga zëri që të udhëheq.'
 WHERE id = '73b9de8a-ab5c-11f1-97ee-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditim për të manifestuar me dritë · Manifestim
UPDATE meditations SET description = 'Manifestim me dritë. Qëllimi mbahet në qendër të kraharorit dhe ushqehet me frymë e imazh, derisa të mos ndihet si lutje e largët, por si diçka që po ndodh.'
 WHERE id = '73b9df5f-ab5c-11f1-97ee-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditim për të marrë bekime · Bollëku
UPDATE meditations SET description = 'Vizualizim për ta mësuar zemrën të marrë. Duart hapen, mbrojtja ulet, dhe ajo që vjen — ndihma, dashuria, mundësia — pranohet pa fajin që e kthen mbrapsht.'
 WHERE id = '73b9e006-ab5c-11f1-97ee-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditim për të marrë dhe rrezatuar dritë · Energji e lartë
UPDATE meditations SET description = 'Praktikë me dritën që hyn dhe del. Merret me thithje, mbahet në qendër, dhe rrezatohet me nxjerrje drejt njerëzve e vendeve që zgjedh ti.'
 WHERE id = '73b9e07d-ab5c-11f1-97ee-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Meditim për të rritur ndërgjegjen · Intuita
UPDATE meditations SET description = 'Vizualizim për ta ngritur vëmendjen mbi zhurmën e përditshme. Ngadalë, shkallë-shkallë, derisa gjërat të duken nga një lartësi tjetër — dhe ajo që dukej e ngatërruar të thjeshtohet.'
 WHERE id = '73b9e100-ab5c-11f1-97ee-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Partneri ideal · Jeta ideale
UPDATE meditations SET description = 'Vizualizim i partnerit që kërkon — jo fytyra, por mënyra si ndihesh pranë tij. Seanca e qartëson atë ndjesi, që ta njohësh kur ta takosh.'
 WHERE id = '5ecd0216-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Skenari i suksesit · Jeta ideale
UPDATE meditations SET description = 'Provë me mendje e çastit të suksesit. Skena ndërtohet me detaje dhe përsëritet, që trupi ta njohë kur të vijë vërtet dhe të mos ngrijë.'
 WHERE id = '5ecd02ab-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Shtëpia ideale · Jeta ideale
UPDATE meditations SET description = 'Vizualizim i shtëpisë që do. Dritë, dhoma, zëra, tavolina ku ulesh — sa më e prekshme, aq më e lehtë për ta njohur kur ta shohësh.'
 WHERE id = '5ecd0196-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Takimi me mentorin · Vetja e së ardhmes
UPDATE meditations SET description = 'Takim i brendshëm me një mentor — dikë real ose një figurë të mençur. Pyetja që mban brenda i drejtohet atij, dhe përgjigjja dëgjohet në heshtje.'
 WHERE id = '5ecd010a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Takimi me veten e ardhshme · Vetja e së ardhmes
UPDATE meditations SET description = 'Takim me veten tënde pas disa vitesh. Ajo pjesë e ka kaluar tashmë atë që po jeton ti sot, dhe seanca të lë kohë ta pyesësh dhe ta dëgjosh.'
 WHERE id = '5ecd003e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Trupi ideal · Jeta ideale
UPDATE meditations SET description = 'Vizualizim i trupit të shëndetshëm e të fortë, ashtu si e do. Punon me marrëdhënien me të — pa urrejtje dhe pa afate — dhe e mban imazhin me frymë.'
 WHERE id = '5ecd0253-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Versioni më i mirë i vetes · Vetja e së ardhmes
UPDATE meditations SET description = 'Takim me versionin tënd më të mirë: si ecën, si flet, si vendos. Seanca e vëzhgon nga afër dhe pastaj ju bashkon, që ajo mënyrë të nisë sot.'
 WHERE id = '5ecd0081-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Meditim në ecje (4) ───────────────

-- Body scan · Qetësim
UPDATE meditations SET description = 'Skanim i trupit nga koka te këmbët, pjesë pas pjese. Nuk kërkon të ndryshosh asgjë — vetëm të vësh re, dhe ajo që vërehet zakonisht lëshon vetë.'
 WHERE id = '5eccf9fb-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Grounding · Qetësim
UPDATE meditations SET description = 'Tokëzim me këmbët në dysheme. Vëmendja zbret poshtë, pesha ndihet te thembrat, dhe ankthi që rri lart te gjoksi gjen ku të shkarkohet.'
 WHERE id = '5eccf9af-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Somatic dancing · Qetësim
UPDATE meditations SET description = 'Lëvizje e lirë me muzikë, pa hapa të mësuar. Trupi udhëheq dhe emocioni gjen rrugë nga lëvizja — praktikë për ditët kur fjalët nuk mjaftojnë.'
 WHERE id = '5eccfa81-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Somatic walking · Qetësim
UPDATE meditations SET description = 'Ecje e ngadaltë me vëmendje te çdo hap: pesha që kalon, toka që përgjigjet, fryma që ndjek ritmin. Bëhet jashtë ose brenda, pa destinacion.'
 WHERE id = '5eccfa3d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Meditime për Trurin (20) ───────────────

-- Burnout · Fokus dhe performancë
UPDATE meditations SET description = 'Për lodhjen që gjumi nuk e heq më. Seanca e njeh gjendjen pa e quajtur dobësi, ul detyrimin për të vazhduar me çdo kusht, dhe kthen një ritëm që trupi mund ta mbajë.'
 WHERE id = '5ed0979f-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- CEO Mindset · Fokus dhe performancë
UPDATE meditations SET description = 'Mendësi drejtuese: vendime pa ngurrim të gjatë, prioritete të pakta, dhe qetësi kur gjërat nuk shkojnë sipas planit. Dëgjohet në fillim të javës.'
 WHERE id = '5ed09498-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Delegimi · Fokus dhe performancë
UPDATE meditations SET description = 'Për atë që mban gjithçka vetë. Punon me bindjen se askush nuk e bën dot si ti, dhe e përgatit mendjen ta lëshojë kontrollin pjesë-pjesë.'
 WHERE id = '5ed09715-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Fokus ekstrem · Tru i fuqizuar
UPDATE meditations SET description = 'Trajnim i vëmendjes për punë të thellë. Mendja mbahet te një pikë e vetme dhe kthehet aty sa herë ikën — pikërisht ky kthim është ushtrimi.'
 WHERE id = '5ec89d72-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Intuitë · Intuita
UPDATE meditations SET description = 'Për zërin e brendshëm që dëgjohet vetëm kur bie zhurma. Seanca e ul analizën dhe pastaj ushtron dallimin mes një sinjali të qetë dhe një frike të nxituar.'
 WHERE id = '5ec89f52-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kreativitet · Tru i fuqizuar
UPDATE meditations SET description = 'Për mendjen që kërkon ide. Vëmendja lirohet nga kontrolli i ngushtë dhe lihet të shkojë anash — gjendja ku lidhjet e papritura shfaqen vetë.'
 WHERE id = '5ec89ec7-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kreativiteti · Fokus dhe performancë
UPDATE meditations SET description = 'Kreativiteti si punë, jo si frymëzim që vjen rastësisht. Seanca e heq frikën e faqes bosh dhe e vendos mendjen në gjendjen ku puna nis pa u menduar gjatë.'
 WHERE id = '5ed096d4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kujtesë më e mirë · Tru i fuqizuar
UPDATE meditations SET description = 'Praktikë për kujtesën. Punon me vëmendjen në çastin e kodimit — sepse nuk harrohet ajo që u dëgjua vërtet — dhe me qetësinë që e lejon rikthimin.'
 WHERE id = '5ec89db3-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Lideri · Fokus dhe performancë
UPDATE meditations SET description = 'Për atë që udhëheq njerëz. Punon me vendimet e vështira, me kufijtë ndaj ekipit dhe me qetësinë që të tjerët e marrin nga ti pa e ditur.'
 WHERE id = '5ed09580-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Marketingu · Fokus dhe performancë
UPDATE meditations SET description = 'Për mendjen që kërkon të kuptojë klientin. Seanca e heq zhurmën e trendeve dhe e kthen vëmendjen te njeriu që do t''i flasësh dhe te fjala që e prek.'
 WHERE id = '5ed09692-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Mendo qartë · Tru i fuqizuar
UPDATE meditations SET description = 'Për ditët kur mendimet ngatërrohen. Seanca i ndan gjërat në radhë — çfarë është fakt, çfarë është supozim, çfarë varet nga ti — derisa pamja të kthjellohet.'
 WHERE id = '5ec89fe8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Për moshën mbi 50 vjeç · Tru i fuqizuar
UPDATE meditations SET description = 'Praktikë për mendjen pas të pesëdhjetave. Ushtrime të buta vëmendjeje dhe kujtese, me ritëm të qetë dhe pa krahasim me askënd.'
 WHERE id = '5ec89e87-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Për provime · Tru i fuqizuar
UPDATE meditations SET description = 'Për periudhat e provimeve. Ul ankthin që e bllokon kujtesën dhe e kthen fokusin te materiali; mund të dëgjohet para çdo seance mësimi.'
 WHERE id = '5ec89e41-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Produktiviteti · Fokus dhe performancë
UPDATE meditations SET description = 'Për ditët e ngarkuara. Seanca e qartëson detyrën e vetme që ka rëndësi tani dhe e heq ndjesinë e listës së pafund që rëndon mbi çdo hap.'
 WHERE id = '5ed09755-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Sipërmarrësi · Fokus dhe performancë
UPDATE meditations SET description = 'Për atë që ndërton diçka të vetën. Punon me pasigurinë e rrugës, me rrezikun e matur dhe me durimin që kërkon një projekt i gjatë.'
 WHERE id = '5ed09527-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Studim intensiv · Tru i fuqizuar
UPDATE meditations SET description = 'Për orët e gjata të studimit. Cikle vëmendjeje me pushime të shkurtra dhe një gjendje e qetë përqendrimi, që mësimi të mos kthehet në luftë me veten.'
 WHERE id = '5ec89df5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Shitjet · Fokus dhe performancë
UPDATE meditations SET description = 'Për bisedën me klientin. Heq ankthin e refuzimit dhe e kthen shitjen në dëgjim: çfarë i duhet atij, dhe si mund ta ndihmosh vërtet.'
 WHERE id = '5ed0963c-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vendimmarrja · Fokus dhe performancë
UPDATE meditations SET description = 'Për vendimet që mbeten pezull. Seanca ndan frikën nga fakti, vendos kriteret, dhe e lë përgjigjen të dalë pa presionin e përsosmërisë.'
 WHERE id = '5ed095db-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vendimmarrje · Tru i fuqizuar
UPDATE meditations SET description = 'Praktikë vendimmarrjeje. Të dyja rrugët provohen me mendje, njëra pas tjetrës, dhe vërehet si përgjigjet trupi te secila — informacion që mendja vetëm nuk e jep.'
 WHERE id = '5ec89f0d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Zgjidh probleme · Tru i fuqizuar
UPDATE meditations SET description = 'Për problemet që kanë ngecur. Seanca e largon vëmendjen nga zgjidhja e detyruar dhe e lë mendjen të punojë nën sipërfaqe, ku shpesh gjendet rruga.'
 WHERE id = '5ec89f9e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Rigjenerim dhe shërim (11) ───────────────

-- Dhimbje koke · Shëndeti
UPDATE meditations SET description = 'Relaksim i thellë për kokën që dhemb nga tensioni. Lirim i nofullës, qafës dhe zonës rreth syve, me frymë të ngadaltë. Praktikë shoqëruese — nuk zëvendëson vlerësimin e mjekut.'
 WHERE id = '5ecdeb25-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Hashimoto · Shëndeti
UPDATE meditations SET description = 'Praktikë mbështetëse për ata që jetojnë me Hashimoto. Punon me lodhjen, me durimin ndaj trupit dhe me qetësimin e sistemit nervor. Nuk zëvendëson terapinë e përcaktuar nga mjeku.'
 WHERE id = '5ecfaf3a-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- IBS · Shëndeti
UPDATE meditations SET description = 'Relaksim i drejtuar te zona e barkut, ku stresi ndihet i pari. Frymë e butë dhe vëmendje pa tension. Praktikë shoqëruese — nuk zëvendëson trajtimin mjekësor.'
 WHERE id = '5ecfaecc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Inflamacion · Shëndeti
UPDATE meditations SET description = 'Praktikë qetësuese për ditët kur trupi ndihet i ngarkuar. Relaksim i thellë, frymë e ngadaltë dhe pushim i vërtetë. Shoqëruese e kujdesit mjekësor, jo zëvendësim i tij.'
 WHERE id = '5ecfaf92-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Lodhje · Shëndeti
UPDATE meditations SET description = 'Për lodhjen që zgjat. Seanca nuk kërkon energji nga ti: jep pushim të strukturuar, me frymë e relaksim, dhe e ul detyrimin për të qenë në këmbë.'
 WHERE id = '5ecfafec-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Mbështetje gjatë rikuperimit · Shëndeti
UPDATE meditations SET description = 'Për periudhën e rikuperimit pas një sëmundjeje a ndërhyrjeje. Ritëm i ngadaltë, vëmendje e butë ndaj trupit dhe durim me kohën që kërkon. Ndiq gjithnjë udhëzimet e mjekut.'
 WHERE id = '5ecfb02f-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Menopauzë · Dashuria ndaj vetes
UPDATE meditations SET description = 'Për vitet e menopauzës. Punon me valët e nxehtësisë, gjumin e ndërprerë dhe luhatjet e humorit, me qetësim dhe me pranim të një trupi që po ndryshon.'
 WHERE id = '5ecfb088-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Migrenë · Shëndeti
UPDATE meditations SET description = 'Relaksim mbështetës mes krizave të migrenës. Errësirë, frymë e ngadaltë dhe lirim i tensionit te qafa e shpatullat. Nuk zëvendëson kurrë trajtimin e mjekut.'
 WHERE id = '5ecdeb79-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- PMS · Dashuria ndaj vetes
UPDATE meditations SET description = 'Për ditët para ciklit. Punon me ndjeshmërinë, rëndesën dhe tensionin, me frymë e ngrohtësi drejtuar zonës së barkut.'
 WHERE id = '5ecfb0dc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Tension · Shëndeti
UPDATE meditations SET description = 'Relaksim progresiv për tensionin e mbledhur në trup. Çdo grup muskujsh shtrëngohet lehtë dhe lëshohet, nga këmbët te fytyra, derisa trupi të njohë ndryshimin.'
 WHERE id = '5ecdebc4-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Tinnitus · Shëndeti
UPDATE meditations SET description = 'Praktikë mbështetëse për ata që jetojnë me zhurmë në vesh. Punon me vëmendjen — jo për ta hequr tingullin, por për ta ulur alarmin që e shoqëron. Nuk zëvendëson vlerësimin mjekësor.'
 WHERE id = '5ecfae01-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Hipnoterapi (8) ───────────────

-- Gjumi · Shëro të kaluarën
UPDATE meditations SET description = 'Seancë hipnoterapie për gjumin. Induksion i ngadaltë, thellim shkallë-shkallë, dhe sugjerime për një gjumë të qetë. Dëgjohet në shtrat, pa u ngritur më pas.'
 WHERE id = '5ecd06fb-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Humbje peshe · Shëro të kaluarën
UPDATE meditations SET description = 'Hipnoterapi për marrëdhënien me ushqimin. Punon me zakonet e ushqyerjes nga emocioni dhe me imazhin e trupit, pa dieta dhe pa afate.'
 WHERE id = '5ecde27d-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kreativitet · Shëro të kaluarën
UPDATE meditations SET description = 'Hipnoterapi për krijimtarinë. Gjendja e thellë e relaksimit heq censurën e brendshme dhe e lë materialin të vijë pa u gjykuar në çastin që shfaqet.'
 WHERE id = '5ecde3e8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Kujtesë · Shëro të kaluarën
UPDATE meditations SET description = 'Hipnoterapi për kujtesën. Sugjerime për rikthimin e lehtë të informacionit dhe për qetësinë në çastet kur duhet ta kujtosh nën presion.'
 WHERE id = '5ecde3a8-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifestim · Shëro të kaluarën
UPDATE meditations SET description = 'Hipnoterapi për manifestimin. Qëllimi vendoset ndërsa mendja është e hapur dhe e qetë — aty ku pranohet më lehtë sesa gjatë ditës.'
 WHERE id = '5ecde35b-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Ndal duhanin · Shëro të kaluarën
UPDATE meditations SET description = 'Hipnoterapi si mbështetje për lënien e duhanit. Punon me zakonin, me çastet nxitëse dhe me identitetin e njeriut që nuk pi më. Shoqëruese ndaj vendimit tënd, jo zëvendësuese e tij.'
 WHERE id = '5ecde311-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Shërim emocional · Shëro të kaluarën
UPDATE meditations SET description = 'Hipnoterapi për shërim emocional. Kthim i butë te një ngjarje e vjetër, me sigurinë e së tashmes pranë, dhe lirim i asaj që mbeti e pambyllur.'
 WHERE id = '5ecde42f-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Vetëbesim · Shëro të kaluarën
UPDATE meditations SET description = 'Hipnoterapi për vetëbesimin. Sugjerime që zëvendësojnë bindjet e hershme për vlerën tënde, të dhëna ndërsa mendja kritike është e qetë.'
 WHERE id = '5ecde2c9-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Teknika Somatike (11) ───────────────

-- Hapja e qafës · Shëndeti
UPDATE meditations SET description = 'Lirim i qafës. Lëvizje të vogla e të ngadalta, vëmendje te pikat që shtrëngojnë, dhe frymë që i shoqëron — për trupat që rrinë gjatë para ekranit.'
 WHERE id = '5eccfc0e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Lirim i diafragmës · Shëndeti
UPDATE meditations SET description = 'Lirim i diafragmës, muskulit që ngrin i pari nga stresi. Frymë e ulët me dorën mbi bark dhe lëshim gradual, derisa fryma të zbresë vetë.'
 WHERE id = '5eccfb71-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Lirim i kraharorit · Shëndeti
UPDATE meditations SET description = 'Hapje e kraharorit pas ditëve të kërrusura. Lëvizje të buta që zgjerojnë gjoksin dhe frymë që mbush pjesën e sipërme, zakonisht të harruar.'
 WHERE id = '5eccfbbf-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Lirim i legenit · Shëndeti
UPDATE meditations SET description = 'Lirim i zonës së legenit, ku mbahen shumë ndjesi pa u vënë re. Praktikë e ngadaltë dhe e respektueshme, me frymë dhe lëvizje minimale.'
 WHERE id = '5eccfb21-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Lirim i nofullës · Shëndeti
UPDATE meditations SET description = 'Lirim i nofullës — zona që shtrëngohet natën dhe gjatë ditës pa e ditur. Lëvizje të vogla, gjuha e lirshme, dhe frymë përmes gojës gjysmë të hapur.'
 WHERE id = '5eccfacd-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Pendulation · Shëndeti
UPDATE meditations SET description = 'Pendulation: vëmendja lëviz mes një zone që shqetëson dhe një zone që ndihet mirë, para e prapa. Trupi mëson se mund të prekë vështirësinë pa u mbytur në të.'
 WHERE id = '5ecc1c29-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Somatic orienting · Shëndeti
UPDATE meditations SET description = 'Orientim somatik: sytë dhe koka lëvizin ngadalë nëpër hapësirën rreth teje. Sistemi nervor verifikon vetë se çasti është i sigurt — pa asnjë fjalë bindëse.'
 WHERE id = '5ecc1be6-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Somatic shaking · Shëndeti
UPDATE meditations SET description = 'Dridhje e vullnetshme e trupit për të shkarkuar tensionin e mbetur. Nis nga këmbët dhe lihet të përhapet, aq sa është e rehatshme, dhe mbyllet me qetësi.'
 WHERE id = '5ecc1ba5-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Shkundja neurogjene · Shëndeti
UPDATE meditations SET description = 'Shkundje neurogjene — dridhja natyrale që trupi e përdor për të liruar stresin. Praktika e lejon atë të ndodhë në mënyrë të kontrolluar, me udhëzime dhe kufij të qartë.'
 WHERE id = '5ecc1b24-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Titration · Shëndeti
UPDATE meditations SET description = 'Titration: puna me pak në një kohë. Ndjesia e vështirë preket për pak sekonda, pastaj lihet, dhe kthehesh vetëm kur trupi është gati — kurrë e gjitha përnjëherë.'
 WHERE id = '5eccf955-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Trauma release · Shëndeti
UPDATE meditations SET description = 'Praktikë somatike për lirimin e tensionit të mbetur nga përvoja të rënda. Bëhet ngadalë, me kufij dhe me mundësi ndalimi në çdo çast. Nuk zëvendëson terapinë me një specialist.'
 WHERE id = '5ecc1b67-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');


-- ─────────────── Meditime manifestimi (7) ───────────────

-- Manifesto bollëk · Manifestim
UPDATE meditations SET description = 'Meditim manifestimi për bollëkun. Qëllimi formulohet qartë, mbahet me ndjesinë e tij në trup, dhe mbyllet me mirënjohje — sikur të kishte ardhur tashmë.'
 WHERE id = '5ecaef45-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto klientë · Manifestim
UPDATE meditations SET description = 'Për ata që presin klientë. Qartësohet kujt i shërben puna jote, dhe imazhi mbahet derisa të ndihet i natyrshëm, pa lutje dhe pa nxitim.'
 WHERE id = '5ecaf26e-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto partner · Manifestim
UPDATE meditations SET description = 'Manifestim i një lidhjeje. Puna nis nga ajo që do të ndiesh pranë atij njeriu, jo nga pamja e tij, dhe mbaron me hapjen ndaj takimit.'
 WHERE id = '5ecaef91-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto punë · Manifestim
UPDATE meditations SET description = 'Manifestim i punës që kërkon. Ndërtohet dita e saj me detaje — çfarë bën, me kë, si ndihesh në fund — dhe mbahet me frymë derisa të bëhet e njohur.'
 WHERE id = '5ecaf22b-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto sukses · Manifestim
UPDATE meditations SET description = 'Manifestim i suksesit sipas kuptimit tënd, jo të të tjerëve. Seanca e qartëson atë kuptim para se ta mbajë imazhin.'
 WHERE id = '5ecaf2fc-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto shëndet · Manifestim
UPDATE meditations SET description = 'Manifestim me fokus te shëndeti dhe vitaliteti. Mbahet imazhi i trupit të qetë e funksional, me mirënjohje për atë që bën sot. Praktikë shoqëruese — nuk zëvendëson trajtimin mjekësor.'
 WHERE id = '5ecaf2bf-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

-- Manifesto shtëpi · Manifestim
UPDATE meditations SET description = 'Manifestim i shtëpisë. Ndërtohet me shqisat — drita nga dritarja, hapi në dysheme, zëri në dhomë — dhe mbyllet me ndjesinë e të qenit tashmë aty.'
 WHERE id = '5ecaf1e3-a510-11f1-b99e-107c614af9b1'
   AND (description IS NULL OR description = ''
        OR description LIKE '%praktikë e udhëhequr nga Arte Gogo%');

