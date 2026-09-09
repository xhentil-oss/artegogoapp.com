<#
════════════════════════════════════════════════════════════════
 NGARKIMI I AUDIOS DHE KOPERTINAVE TE cPANEL, MBI FTPS

 Ekzekutohet te dritarja E TUA PowerShell. Fjalëkalimi kërkohet aty dhe
 nuk shkruhet askund: nuk kalon nëpër bisedë, nuk hyn te git, dhe nuk
 shfaqet as te lista e proceseve — curl-i i lexon kredencialet nga stdin
 (`-K -`), jo nga rreshti i komandës.

 PËRDORIMI
   # 1. Kontroll pa ngarkuar — cilët skedarë njihen, cilët mungojnë:
   .\scripts\ngarko-audio.ps1 -Nga "D:\audio" -VetemKontroll

   # 2. Ngarkimi i vërtetë:
   .\scripts\ngarko-audio.ps1 -Nga "D:\audio"

   # 3. Kopertinat:
   .\scripts\ngarko-audio.ps1 -Cfare kopertina -Nga ".\design\kopertina"

 ⚠️  DOSJET NUK I RENDIT TI. Skedarët kërkohen në thellësi te `-Nga`, dhe
     secili shkon te dosja që i takon sipas databazës — `meditime/<teknika>/`.
     Rrugët lexohen nga `scripts/audio-manifest.txt`, i nxjerrë drejt e nga
     `mysql/*.sql`, ndaj disku dhe databaza nuk kanë si të ndryshojnë.

 ⚠️  E RINISSHME. Para ngarkimit lexohet lista e vërtetë te serveri, dhe
     skedarët që ndodhen aty me TË NJËJTËN madhësi kapërcehen. Nëse lidhja
     bie te skedari i 140-të, e nis sërish dhe vazhdon nga ai — kjo është e
     domosdoshme për 250 skedarë mbi një lidhje shtëpie.

 ⚠️  Emri duhet SAKTËSISHT si te databaza. Linux-i i dallon shkronjat e
     mëdha, dhe një emër i shkruar gabim nuk nxjerr gabim — nxjerr 404, që
     aplikacioni e tregon si "Audio ende nuk është ngarkuar". Prandaj njohja
     bëhet pa dallim shkronje dhe ngarkimi bëhet me emrin KANONIK: Windows-i
     nuk e mban shkronjën, ndaj emri vendor mund të vijë si të dojë.

 ⚠️  Për `-Ku mbrojtur` (parazgjedhja) duhet llogaria KRYESORE e cPanel-it,
     me shtëpi `/home2/appdrartegogo`. Një llogari FTP e kufizuar te
     `public_html` nuk e shikon dosjen `audio/`, sepse ajo rri jashtë me qëllim.

 ⚠️  Ky skedar duhet i ruajtur si UTF-8 ME BOM. Pa BOM-in, PowerShell 5.1 e
     lexon si ANSI dhe shkronjat `ë`/`ç` e prishin parse-in.
════════════════════════════════════════════════════════════════
#>

[CmdletBinding()]
param(
    [ValidateSet("audio", "kopertina")]
    [string]$Cfare = "audio",

    # Dosja vendore. Kërkohet në thellësi.
    [string]$Nga = ".",

    # `mbrojtur` → /home2/appdrartegogo/audio/…   (shërbehet nga audio.php)
    # `publik`   → /home2/appdrartegogo/public_html/…  (pa mbrojtje)
    [ValidateSet("mbrojtur", "publik")]
    [string]$Ku = "mbrojtur",

    [string]$Serveri = "ftp.drartegogo.com",

    # Vetëm raport: krahason emrat vendorë me databazën, pa u lidhur fare.
    [switch]$VetemKontroll,

    # Ngarko edhe skedarë me emra që databaza nuk i njeh.
    [switch]$Detyro
)

$ErrorActionPreference = "Stop"

# ── Çfarë pret databaza ─────────────────────────────────────────

if ($Cfare -eq "audio") {
    $manifest = Join-Path $PSScriptRoot "audio-manifest.txt"
    if (-not (Test-Path $manifest)) {
        Write-Host "Mungon $manifest" -ForegroundColor Red
        exit 1
    }
    # Rreshta si: meditime/vizualizim/dita-perfekte.mp3
    $pritur = @(Get-Content -LiteralPath $manifest -Encoding UTF8 | Where-Object { $_.Trim() -ne "" })
    $zgjatimi = "mp3"
    if ($Ku -eq "mbrojtur") {
        $baza = "audio"
        $shpjegim = "jashtë public_html — shërbehet vetëm nga audio.php"
    } else {
        $baza = "public_html"
        $shpjegim = "brenda public_html — PA mbrojtje, kushdo me adresën e shkarkon"
    }
} else {
    $SLUGS = @(
        "meditim-per-te-gjetur-rrugen-me-te-larte",
        "meditim-per-te-lexuar-librin-e-jetes",
        "meditim-per-te-manifestuar-me-drite",
        "meditim-per-te-marre-bekime",
        "meditim-per-te-marre-dhe-rrezatuar-drite",
        "meditim-per-te-rritur-ndergjegjen"
    )
    $pritur = @($SLUGS | ForEach-Object { "kopertina/$_.jpeg" })
    $zgjatimi = "jpeg"
    $baza = "public_html"
    $shpjegim = "publike, pa nënshkrim — biblioteka i tregon edhe meditimet e kyçura"
}

# Emri i skedarit → rruga e plotë e larguar (pa dallim shkronje te kërkimi).
$sipasEmrit = @{}
foreach ($rel in $pritur) {
    $emri = $rel.Substring($rel.LastIndexOf("/") + 1)
    $sipasEmrit[$emri.ToLowerInvariant()] = $rel
}

# ── Skedarët vendorë ────────────────────────────────────────────

$burimi = (Resolve-Path -LiteralPath $Nga).Path
Write-Host ""
Write-Host "Nga  : $burimi   (kërkim në thellësi)"
Write-Host "Te   : $baza/…   ($shpjegim)"
Write-Host "Pret : $($pritur.Count) skedarë sipas databazës"
Write-Host ""

$vendore = @(Get-ChildItem -LiteralPath $burimi -Filter "*.$zgjatimi" -File -Recurse)

$radhe = @()
$panjohur = @()
foreach ($f in $vendore) {
    $kanonik = $sipasEmrit[$f.Name.ToLowerInvariant()]
    if ($null -eq $kanonik) { $panjohur += $f; continue }
    $emriKanonik = $kanonik.Substring($kanonik.LastIndexOf("/") + 1)
    $radhe += [PSCustomObject]@{
        Vendor    = $f
        Larget    = $kanonik                               # meditime/<teknika>/<emri>
        Dosje     = $kanonik.Substring(0, $kanonik.LastIndexOf("/"))
        Emri      = $emriKanonik
        Riemerton = ($f.Name -cne $emriKanonik)
    }
}

$gjetur = @($radhe | ForEach-Object { $_.Larget })
$mungojne = @($pritur | Where-Object { $gjetur -notcontains $_ })

Write-Host "  gati vendore : $($radhe.Count)"
Write-Host "  mungojnë     : $($mungojne.Count)"
Write-Host "  të panjohura : $($panjohur.Count)"

foreach ($r in ($radhe | Where-Object { $_.Riemerton })) {
    Write-Host ("  shkronja     {0}  →  {1}" -f $r.Vendor.Name, $r.Emri) -ForegroundColor Yellow
}
foreach ($p in $panjohur) {
    Write-Host ("  I PANJOHUR   {0}  — databaza nuk e pret këtë emër" -f $p.Name) -ForegroundColor Red
}

if ($VetemKontroll) {
    Write-Host ""
    Write-Host "Sipas dosjeve (gjetur / pritur):"

    # Sa pret databaza për çdo dosje — që raporti të tregojë progresin, jo
    # vetëm atë që ndodh të kesh në dorë.
    $pritenSipasDosjes = @{}
    foreach ($rel in $pritur) {
        $d = $rel.Substring(0, $rel.LastIndexOf("/"))
        if ($pritenSipasDosjes.ContainsKey($d)) { $pritenSipasDosjes[$d]++ } else { $pritenSipasDosjes[$d] = 1 }
    }
    $gjeturSipasDosjes = @{}
    foreach ($r in $radhe) {
        if ($gjeturSipasDosjes.ContainsKey($r.Dosje)) { $gjeturSipasDosjes[$r.Dosje]++ } else { $gjeturSipasDosjes[$r.Dosje] = 1 }
    }
    foreach ($d in ($pritenSipasDosjes.Keys | Sort-Object)) {
        $g = 0
        if ($gjeturSipasDosjes.ContainsKey($d)) { $g = $gjeturSipasDosjes[$d] }
        $ngjyra = "Gray"
        if ($g -eq $pritenSipasDosjes[$d]) { $ngjyra = "Green" } elseif ($g -gt 0) { $ngjyra = "Yellow" }
        Write-Host ("  {0,-34} {1,3} / {2,3}" -f $d, $g, $pritenSipasDosjes[$d]) -ForegroundColor $ngjyra
    }

    if ($mungojne.Count -gt 0) {
        Write-Host ""
        Write-Host "Mungojnë vendore ($($mungojne.Count)) — 20 të parat:" -ForegroundColor Yellow
        $mungojne | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
    }
    Write-Host ""
    Write-Host "Kontroll i kryer. Pa -VetemKontroll, ngarkohen $($radhe.Count) skedarë." -ForegroundColor Cyan
    exit 0
}

if ($panjohur.Count -gt 0 -and -not $Detyro) {
    Write-Host ""
    Write-Host "Ndalim: emra që databaza nuk i njeh. Krahasoji me scripts/audio-manifest.txt," -ForegroundColor Red
    Write-Host "ose ekzekuto sërish me -Detyro." -ForegroundColor Red
    exit 1
}
if ($radhe.Count -eq 0) {
    Write-Host ""
    Write-Host "Asnjë skedar për ngarkim." -ForegroundColor Yellow
    exit 1
}

# ── Kredencialet ────────────────────────────────────────────────

Write-Host ""
if ($Ku -eq "mbrojtur") {
    Write-Host "Duhet llogaria KRYESORE e cPanel-it (shtëpia /home2/appdrartegogo)." -ForegroundColor Cyan
}
$perdoruesi = Read-Host "Përdoruesi FTP"
$fjalekalimi = Read-Host "Fjalëkalimi" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($fjalekalimi)
try { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }

$curl = (Get-Command curl.exe).Source

<#
 Kredencialet kalojnë me `-K -`, pra si konfigurim te stdin. Po të ishin
 argumente, fjalëkalimi do dukej te `Get-Process` dhe te historiku i dritares.
 `--ssl-reqd` e detyron TLS: pa të, curl-i kthehet te FTP i thjeshtë dhe
 fjalëkalimi kalon i zhveshur.
#>
function Kredencialet { "user = `"$perdoruesi`:$plain`"`nssl-reqd`nsilent`nshow-error" }

# ── Lista e vërtetë te serveri (për rinisje) ────────────────────

Write-Host ""
Write-Host "Po lexohet çfarë ndodhet te serveri…"

$largetMadhesi = @{}
foreach ($dosje in ($radhe | Select-Object -ExpandProperty Dosje -Unique)) {
    $cfg = (Kredencialet) + "`nurl = `"ftp://$Serveri/$baza/$dosje/`""
    $rreshta = $cfg | & $curl -K - 2>$null
    foreach ($r in $rreshta) {
        # Listim Unix: perms links owner group SIZE mon dd hh:mm emri
        if ($r -match '^\S+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\S+\s+\S+\s+(.+)$') {
            $largetMadhesi["$dosje/$($Matches[2])"] = [int64]$Matches[1]
        }
    }
}
Write-Host "  skedarë të gjetur te serveri: $($largetMadhesi.Count)"

# ── Ngarkimi ────────────────────────────────────────────────────

$kapercyer = 0; $ngarkuar = 0; $deshtuan = 0; $i = 0
Write-Host ""
foreach ($r in ($radhe | Sort-Object Larget)) {
    $i++
    $ekziston = $largetMadhesi[$r.Larget]
    if ($null -ne $ekziston -and $ekziston -eq $r.Vendor.Length) {
        $kapercyer++
        continue
    }

    $mb = [math]::Round($r.Vendor.Length / 1MB, 1)
    Write-Host ("  [{0}/{1}] {2}  ({3} MB) …" -f $i, $radhe.Count, $r.Emri, $mb) -NoNewline

    $rrugaVendore = $r.Vendor.FullName.Replace("\", "/")
    $cfg = (Kredencialet) + "`nftp-create-dirs`nupload-file = `"$rrugaVendore`"`nurl = `"ftp://$Serveri/$baza/$($r.Larget)`""
    $cfg | & $curl -K -
    if ($LASTEXITCODE -eq 0) { Write-Host "  u krye" -ForegroundColor Green; $ngarkuar++ }
    else { Write-Host ("  DËSHTOI (curl {0})" -f $LASTEXITCODE) -ForegroundColor Red; $deshtuan++ }
}

$plain = $null
[GC]::Collect()

Write-Host ""
Write-Host "u ngarkuan: $ngarkuar · u kapërcyen (ekzistonin): $kapercyer · dështuan: $deshtuan"
if ($mungojne.Count -gt 0) {
    Write-Host "mungojnë vendore: $($mungojne.Count) nga $($pritur.Count)" -ForegroundColor Yellow
}
if ($deshtuan -gt 0) {
    Write-Host "Ekzekutoje sërish — skedarët e mbërritur kapërcehen, dhe vazhdon nga të tjerët." -ForegroundColor Cyan
    exit 1
}
