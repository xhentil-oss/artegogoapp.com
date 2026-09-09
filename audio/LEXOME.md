# Verifikuesi i audios — vendosja te cPanel

Kjo dosje shkon te **`public_html/audio/`**. Skedarët MP3 **nuk** shkojnë këtu.

## Çfarë zgjidh

`api/src/routes/audio.js` nënshkruan një lidhje pasi kontrollon abonimin, por
deri tani asnjeri nuk e verifikonte nënshkrimin: audiot rrinin te
`public_html/meditime/` dhe Apache-ja i shërbente kujtdo që hamendësonte emrin
— dhe emri rrjedh drejt e nga titulli (`mysql/13_gjashte_meditime.sql`). Pra
porta e abonimit mbronte vetëm *dhënien* e lidhjes, kurrë skedarin.

Pas kësaj: skedarët rrinë jashtë `public_html`, ku Apache-ja nuk arrin, dhe e
vetmja rrugë kalon nga `audio.php`, që kontrollon HMAC-un, skadimin dhe pastaj
rrjedh skedarin me `Range`.

## Rruga e re

```
GET https://app.drartegogo.com/audio/meditime/vizualizim/<slug>.mp3?expires=…&u=…&sig=…
        └─ public_html/audio/.htaccess → audio.php
                └─ verifikon HMAC_SHA256(AUDIO_SECRET, "<rruga>:<expires>:<userId>")
                        └─ /home2/appdrartegogo/audio/meditime/vizualizim/<slug>.mp3
```

## Hapat, me radhë

**1. Sekreti për PHP-në.** Mjedisi i Node-it nuk arrin te PHP-ja, ndaj sekreti
duhet edhe te një skedar. Te File Manager krijo `/home2/appdrartegogo/config/`
dhe brenda `audio.secret`, me **të njëjtën vlerë** që ka `AUDIO_SECRET` te
Setup Node.js App. Pastaj Permissions → **0600**. (Vlera nuk kalon nëpër bisedë
e nuk hyn te git.)

**2. Dosja e audios.** Krijo `/home2/appdrartegogo/audio/meditime/vizualizim/`.
Jashtë `public_html` me qëllim.

**3. FTP.** Lidhu me **llogarinë kryesore të cPanel-it** (shtëpia
`/home2/appdrartegogo`) — një llogari FTP e kufizuar te `public_html` nuk e
shikon dosjen e re. Host `ftp.drartegogo.com`, porta **21**, FTPS explicit,
mënyra **binary**.

Më e siguruar se me dorë:

```powershell
.\scripts\ngarko-audio.ps1 -Cfare audio -Nga "C:\Users\emanuela\Desktop"
```

Skripti i krahason emrat me ata që pret databaza PARA se të kërkojë
fjalëkalimin, e ndreq vetë shkronjën e madhe (Windows-i nuk e mban), i ngarkon
mbi FTPS pa e kaluar fjalëkalimin te rreshti i komandës, dhe në fund liston
dosjen te serveri me madhësitë e vërteta.

Emrat duhen **saktësisht** si te `mysql/13_gjashte_meditime.sql` — Linux-i i
dallon shkronjat e mëdha, dhe slug-et janë pa `ë`/`ç`. Një emër i shkruar
gabim kthen 404, dhe klienti e tregon si "Audio ende nuk është ngarkuar" — pra
dukje e një skedari të pangarkuar, jo e një gabimi. Prandaj skripti ekziston.

**4. Verifikuesi.** Ngarko `audio.php` dhe `.htaccess` te `public_html/audio/`.
Kujdes: `.htaccess` nis me pikë, ndaj klienti FTP duhet të tregojë skedarët e
fshehur.

**5. Kopertinat.** `cover_url` te SQL-i është `/kopertina/<slug>.jpeg` dhe
lexohet si `<img>` te `src/components/art/CoverArt.jsx`. Të gjashtat rrinë te
`design/kopertina/` dhe shkojnë te `public_html/kopertina/` — publike, pa
nënshkrim, sepse biblioteka i tregon edhe meditimet e kyçura.

```powershell
.\scripts\ngarko-audio.ps1 -Cfare kopertina -Nga ".\design\kopertina"
```

**6. Mjedisi.** Setup Node.js App → `AUDIO_BASE_URL` =
`https://app.drartegogo.com/audio` (tani është pa `/audio`, u ndryshua më 8
shtator për provën) → **RESTART**.

**7. Mbyll vrimën e vjetër.** Fshi `public_html/meditime/` me skedarin e provës.
Pa këtë hap gjithçka më sipër nuk vlen — rruga e pambrojtur mbetet e hapur.

**8. phpMyAdmin → Import:** `mysql/13_gjashte_meditime.sql`. Kontrolli në fund
duhet të kthejë 250 gjithsej, 6 me kopertinë, 6 te nën-grupi i re.

## Provat

Marr lidhjen nga API-ja (me token-in e një llogarie me abonim):

```
GET /api/audio/<meditationId>   →   { "url": "…", "expires_in": 3600 }
```

Mbi atë URL:

| Kërkesa | Pritet |
|---|---|
| `curl -I "<url>"` | `200`, `Content-Type: audio/mpeg`, `Accept-Ranges: bytes`, `Content-Length` i saktë |
| `curl -r 0-99 -o /dev/null -D - "<url>"` | `206` + `Content-Range: bytes 0-99/<madhësia>` |
| URL me një shenjë të ndryshuar te `sig` | `403` |
| URL me `expires` të kaluar | `410` |
| `curl -I ".../audio/meditime/vizualizim/<slug>.mp3"` pa parametra | `400` |
| `curl -I ".../meditime/vizualizim/<slug>.mp3"` (rruga e vjetër) | `404` — dëshmi që hapi 7 u bë |

Nëse dalin `500`: shkaku shkruhet te `error_log` i cPanel-it, dhe janë vetëm
dy — `audio.secret` nuk lexohet, ose është nën 32 shenja.

## Luajtja

Motori i luajtjes u kthye më **9 shtator 2026** (`src/hooks/useTrackAudio.js`,
`src/features/player/usePlayerEngine.js`). Pas hapave më lart, "Luaj" luan
skedarin e vërtetë; shiriti poshtë thotë "Audio e plotë" dhe koha vjen nga
skedari, nuk vjen nga një timer.

Meditimet pa audio — 244 nga 250, plus blloqet e ndërtuesit — vazhdojnë me
tonet. Zgjedhja bëhet vetë, dhe pamja nuk e di fare.

**Defekti që u kap gjatë kthimit** (me gjurmë, jo me lexim kodi): elementi
`<audio>` e vë `paused = true` dhe nxjerr `pause` PARA `ended`. Pra vendimi
"vazhdo te hapi tjetër" lexohej nga një gjendje që sapo ishte zeruar, dhe hapi
i dytë ngarkohej si duhet e rrinte i heshtur — seanca nuk përfundonte kurrë.
Tani `advance(wasPlaying)` e marrë vendimin nga thirrësi.

**Lidhja që skadon nuk e ndal më dëgjimin.** Kur elementi dështon (lidhja mbi
një orë, rrjet i prishur, kërcim te një pjesë e pa-shkarkuar), `useTrackAudio`
merr një lidhje të re dhe kthehet te i njëjti sekond — dy herë, pastaj
raporton. Pa këtë, zëri do të pushonte në mes pa shpjegim.

## Çfarë mbetet pas kësaj

- **Shkarkimi ruan te pajisja, nuk luan pa internet.** Butoni "Shkarko" e ruan
  skedarin te dosja e shkarkimeve dhe e shënon te `/me/downloads`, por player-i
  gjithmonë e kërkon lidhjen nga serveri. Dëgjimi pa internet do të kërkonte
  Cache Storage te service worker-i — punë e veçantë, e pabërë.
- **Nëse audio kalon te një shërbim jashtë** (Bunny, R2, S3 — e këshillueshme
  për 1,2 GB), kjo dosje bie dhe zëvendësohet vetëm `signedUrl()` te
  `api/src/routes/audio.js`. Atëherë duhen edhe koka CORS; tani nuk duhen,
  sepse audio dhe aplikacioni janë te i njëjti origjin.
