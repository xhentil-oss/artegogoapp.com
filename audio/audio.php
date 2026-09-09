<?php
/**
 * ═══════════════════════════════════════════════════════════════
 *  VERIFIKUESI I AUDIOS — porta e vërtetë e skedarit
 *
 *  Shkon te `public_html/audio/`. Skedarët MP3 rrinë JASHTË `public_html`,
 *  te AUDIO_ROOT, ndaj Apache-ja nuk i shërben dot vetë: e vetmja rrugë
 *  drejt tyre kalon nga këtu.
 *
 *  ⚠️  PSE EKZISTON: `api/src/routes/audio.js` nënshkruan një lidhje me HMAC
 *      pasi kontrollon abonimin, por derisa u shkrua kjo, ASNJERI nuk e
 *      verifikonte nënshkrimin — audiot rrinin te `public_html/meditime/` dhe
 *      Apache-ja i jepte kujtdo që hamendësonte emrin (dhe slug-i rrjedh drejt
 *      e nga titulli). Porta e abonimit mbronte vetëm *dhënien* e lidhjes.
 *
 *  ⚠️  NËNSHKRIMI DUHET IDENTIK me atë te Node-i:
 *          HMAC_SHA256(AUDIO_SECRET, "<rruga>:<expires>:<userId>")
 *      Prandaj `AUDIO_SECRET` duhet E NJËJTA VLERË te dy vendet: te
 *      Setup Node.js App (mjedisi i API-t) dhe te SECRET_FILE (për PHP-në).
 *      Mjedisi i Node-it NUK arrin te PHP-ja — janë dy procese të ndryshme.
 *
 *  ⚠️  Pse PHP dhe jo një rrugë tjetër te Node-i: bajtët e audios do të kalonin
 *      nëpër Passenger dhe një proces të vetëm Node — dhjetë dëgjues do të
 *      mbanin dhjetë lidhje të zgjatura te i njëjti proces. PHP-FPM hap një
 *      punëtor për kërkesë dhe kjo është pikërisht puna e tij.
 *
 *  Kërkon PHP >= 7.0. I shkruar pa sintaksë të PHP 8-s me qëllim.
 * ═══════════════════════════════════════════════════════════════
 */

declare(strict_types=1);

/* ─────────── Konfigurimi ─────────── */

/** Ku rrinë vërtet skedarët. JASHTË `public_html` — kjo është gjysma e mbrojtjes. */
define('AUDIO_ROOT', '/home2/appdrartegogo/audio');

/**
 * Skedari me sekretin, gjithashtu jashtë `public_html`, me leje 0600.
 * Vlera vendoset me dorë te cPanel dhe nuk kalon kurrë nëpër git a bisedë.
 */
define('SECRET_FILE', '/home2/appdrartegogo/config/audio.secret');

/**
 * Prefiksi i URL-së nën të cilin rri ky skedar — duhet të përputhet me pjesën
 * e rrugës te `AUDIO_BASE_URL`. Nëse `AUDIO_BASE_URL` bëhet
 * `https://app.drartegogo.com/media`, kjo bëhet `/media/`.
 */
define('URL_PREFIX', '/audio/');

/** Sa bajtë dërgohen njëherësh. 256 KB: kujtesë e vogël, sistem-thirrje të pakta. */
define('CHUNK', 262144);

$MIME = array(
    'mp3' => 'audio/mpeg',
    'm4a' => 'audio/mp4',
    'ogg' => 'audio/ogg',
    'wav' => 'audio/wav',
);

/* ─────────── Ndihmësa ─────────── */

/**
 * Ndalesa. Trupi është JSON sepse klienti e merr skedarin me `fetch` te
 * `services/audio.js` — një faqe HTML gabimi do të mbërthehej si blob.
 */
function deny($code, $msg)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(array('error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

/* ─────────── 1. Metoda ─────────── */

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    header('Allow: GET, HEAD');
    deny(405, 'Metodë e papranuar.');
}

/* ─────────── 2. Rruga e kërkuar ─────────── */

/*
 * Rruga merret nga REQUEST_URI dhe NUK merret nga vargu i pyetjes, që një
 * `&f=…` i shtuar me dorë te një lidhje e vlefshme të mos zhvendosë kërkesën
 * te një skedar tjetër. (Edhe atëherë nënshkrimi nuk do të përputhej, sepse
 * HMAC-u llogaritet mbi të njëjtën vlerë që shërbehet — por mos e lër
 * mbrojtjen te një hap i vetëm.)
 */
$uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$qpos = strpos($uri, '?');
if ($qpos !== false) {
    $uri = substr($uri, 0, $qpos);
}
$uri = rawurldecode($uri);

if (strpos($uri, URL_PREFIX) === 0) {
    $path = substr($uri, strlen(URL_PREFIX));
} else {
    /* Rezervë, nëse rishkrimi te `.htaccess` ndryshon. */
    $path = isset($_GET['f']) ? (string) $_GET['f'] : '';
}

/*
 * Lista e bardhë e formës. Pika NUK lejohet brenda segmenteve, ndaj `..` nuk
 * kalon dot — dhe as `/` në fillim, as segment bosh. Nuk mbështetet te
 * `realpath` i vetëm: filtri i formës vjen i pari sepse kurrë nuk duhet të
 * arrijmë te disku me një rrugë të papastër.
 */
if (!preg_match('#^(?:[A-Za-z0-9_\-]+/)*[A-Za-z0-9_\-]+\.(mp3|m4a|ogg|wav)$#i', $path, $ext)) {
    deny(400, 'Kërkesë e pavlefshme.');
}

/* ─────────── 3. Parametrat e nënshkrimit ─────────── */

$expires = isset($_GET['expires']) ? (string) $_GET['expires'] : '';
$user    = isset($_GET['u']) ? (string) $_GET['u'] : '';
$sig     = isset($_GET['sig']) ? (string) $_GET['sig'] : '';

/*
 * `expires` kontrollohet si VARG dhe HMAC-u llogaritet mbi vargun e papërpunuar
 * — pikërisht ashtu si e shkroi Node-i. Nëse do e kthenim në numër dhe pas
 * kthimit prapë në varg, `expires=0100` do të bëhej `100` dhe një nënshkrim i
 * vlefshëm do të prishej pa arsye.
 */
if (!preg_match('/^[0-9]{1,12}$/', $expires)) deny(400, 'Kërkesë e pavlefshme.');
if (!preg_match('/^[A-Za-z0-9_\-]{1,64}$/', $user)) deny(400, 'Kërkesë e pavlefshme.');
if (!preg_match('/^[a-f0-9]{64}$/', $sig)) deny(403, 'Nënshkrim i pavlefshëm.');

/* ─────────── 4. Sekreti ─────────── */

$secret = @file_get_contents(SECRET_FILE);
if ($secret === false) {
    error_log('audio.php: SECRET_FILE nuk lexohet: ' . SECRET_FILE);
    deny(500, 'Konfigurim i paplotë te serveri.');
}
/* Trim: File Manager-i i cPanel-it shton rresht të re në fund pa e thënë. */
$secret = trim($secret);
if (strlen($secret) < 32) {
    error_log('audio.php: AUDIO_SECRET nën 32 shenja.');
    deny(500, 'Konfigurim i paplotë te serveri.');
}

/* ─────────── 5. Verifikimi ─────────── */

$expected = hash_hmac('sha256', $path . ':' . $expires . ':' . $user, $secret);

/*
 * `hash_equals` dhe jo `===`: krahasimi i vargjeve del sapo ndryshon shenja e
 * parë, dhe koha e përgjigjes tregon sa shenja u gjetën — kjo lejon të
 * ndërtohet nënshkrimi shenjë pas shenje.
 */
if (!hash_equals($expected, $sig)) {
    deny(403, 'Nënshkrim i pavlefshëm.');
}

/*
 * Skadimi kontrollohet PAS nënshkrimit, dhe ekzistenca e skedarit vjen e
 * fundit: kush nuk ka nënshkrim të vlefshëm nuk merr të dijë as çfarë
 * skedarësh ekzistojnë.
 *
 * Kufi i sipërm te `expires` nuk vendoset me dashje: një datë e largme do të
 * kërkonte sekretin për t'u nënshkruar, dhe nëse sekreti bie, kufiri nuk
 * mbron asgjë. Ajo që mbron atje është ndryshimi i `AUDIO_SECRET` te dy vendet.
 */
if ((int) $expires < time()) {
    deny(410, 'Lidhja skadoi.');
}

/* ─────────── 6. Skedari ─────────── */

$root = realpath(AUDIO_ROOT);
$full = realpath(AUDIO_ROOT . '/' . $path);

/*
 * Rripi i dytë i sigurisë: edhe pas filtrit të formës, rruga e zgjidhur duhet
 * të bjerë brenda AUDIO_ROOT. Kap rastin e një lidhjeje simbolike që del jashtë.
 */
if ($root === false || $full === false
    || strpos($full, $root . DIRECTORY_SEPARATOR) !== 0
    || !is_file($full) || !is_readable($full)) {
    deny(404, 'Audio ende nuk është ngarkuar.');
}

$size = filesize($full);
if ($size === false) {
    deny(500, 'Skedari nuk lexohet.');
}

/* ─────────── 7. Range ─────────── */

/*
 * Pa Range, Safari-ja te iOS NUK e luan fare audion, dhe kërcimi te minuta 7
 * do të shkarkonte gjithë skedarin nga fillimi. Prandaj kjo pjesë nuk është
 * zbukurim.
 */
$start   = 0;
$end     = $size - 1;
$partial = false;

$range = isset($_SERVER['HTTP_RANGE']) ? trim($_SERVER['HTTP_RANGE']) : '';
if ($range !== '' && preg_match('/^bytes=([0-9]*)-([0-9]*)$/', $range, $m)) {
    /* Range me shumë intervale (`bytes=0-9,20-29`) nuk e kalon regex-in dhe
       bie te përgjigjja e plotë 200 — të cilën specifikimi e lejon. */
    if ($m[1] === '' && $m[2] === '') {
        deny(400, 'Kërkesë e pavlefshme.');
    }
    if ($m[1] === '') {
        /* `bytes=-N`: N bajtët e fundit. */
        $n = (int) $m[2];
        if ($n <= 0) {
            header('Content-Range: bytes */' . $size);
            deny(416, 'Interval i pavlefshëm.');
        }
        $start = $size > $n ? $size - $n : 0;
    } else {
        $start = (int) $m[1];
        if ($m[2] !== '') {
            $end = min((int) $m[2], $size - 1);
        }
    }
    if ($start > $end || $start >= $size) {
        header('Content-Range: bytes */' . $size);
        deny(416, 'Interval i pavlefshëm.');
    }
    $partial = true;
}

$length = $end - $start + 1;

/* ─────────── 8. Kokat ─────────── */

/*
 * Gzip-i fiket: MP3-ja është e kompresuar dhe kompresimi do të hiqte
 * `Content-Length`, pa të cilën shfletuesi nuk tregon dot kohëzgjatjen.
 * Buffer-at e daljes zbrazen që skedari të rrjedhë e të mos mblidhet i tërë
 * në kujtesë.
 */
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}
@ini_set('zlib.output_compression', '0');
@ini_set('output_buffering', '0');
while (ob_get_level() > 0) {
    ob_end_clean();
}
@set_time_limit(0);

$kind = strtolower($ext[1]);
$type = isset($MIME[$kind]) ? $MIME[$kind] : 'application/octet-stream';

header('Content-Type: ' . $type);
header('Content-Length: ' . $length);
header('Accept-Ranges: bytes');
header('X-Content-Type-Options: nosniff');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', (int) filemtime($full)) . ' GMT');
header('ETag: "' . dechex((int) filemtime($full)) . '-' . dechex((int) $size) . '"');

/*
 * `private`: kurrë te një cache i ndarë, sepse lidhja i takon një llogarie.
 * `max-age` sa TTL-ja e lidhjes — brenda saj kërcimet te shiriti lexojnë nga
 * cache-i i shfletuesit e nuk kthehen te serveri.
 */
header('Cache-Control: private, max-age=3600');

if ($partial) {
    http_response_code(206);
    header('Content-Range: bytes ' . $start . '-' . $end . '/' . $size);
}

/* HEAD merr vetëm kokat — Safari-ja e pyet skedarin para se ta luajë. */
if ($method === 'HEAD') {
    exit;
}

/* ─────────── 9. Rrjedha ─────────── */

$fh = fopen($full, 'rb');
if ($fh === false) {
    deny(500, 'Skedari nuk lexohet.');
}
if ($start > 0) {
    fseek($fh, $start);
}

$left = $length;
while ($left > 0 && !feof($fh)) {
    /* Kur klienti e mbyll (kërcim te minuta tjetër, mbyllje faqeje), nuk ka
       kuptim të lexohet pjesa e mbetur. */
    if (connection_aborted()) {
        break;
    }
    $buf = fread($fh, (int) min(CHUNK, $left));
    if ($buf === false || $buf === '') {
        break;
    }
    echo $buf;
    flush();
    $left -= strlen($buf);
}

fclose($fh);
