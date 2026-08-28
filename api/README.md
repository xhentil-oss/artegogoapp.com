# API e Arte Gogo-s — Node.js në cPanel

33 endpoint-e mbi MySQL-në. Kufiri mes aplikacionit dhe databazës: faqja **nuk
lidhet dot drejtpërdrejt** me MySQL — do të thoshte ta vendosje fjalëkalimin e
saj në kodin që shkarkon çdo vizitor.

## Vendosja te cPanel

### 1. Ngarko skedarët

Ngarko dosjen `api/` te `/home/<user>/artegogo-api` (jo te `public_html` —
kodi i serverit nuk duhet të jetë i arritshëm nga interneti).

**Mos ngarko `node_modules/`** — instalohet nga cPanel.

### 2. Krijo aplikacionin

**cPanel → Setup Node.js App → CREATE APPLICATION**

| Fusha | Vlera |
|---|---|
| Node.js version | 18 ose më lart |
| Application mode | Production |
| Application root | `artegogo-api` |
| Application URL | `api.artegogo.al` ose `artegogo.al/api` |
| Application startup file | `app.js` |

### 3. Variablat e mjedisit

Te i njëjti ekran, seksioni **Environment variables**:

| Emri | Vlera |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_NAME` | emri i plotë, p.sh. `perdorues_artegogo` |
| `DB_USER` | përdoruesi i databazës |
| `DB_PASSWORD` | fjalëkalimi |
| `JWT_SECRET` | **së paku 32 shenja të rastësishme** |
| `APP_ORIGIN` | `https://artegogo.al` |
| `AUDIO_SECRET` | së paku 32 shenja, të ndryshme nga JWT |
| `AUDIO_BASE_URL` | ku ndodhen skedarët audio |

Për të gjeneruar një sekret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

⚠️ **Pa `JWT_SECRET` serveri nuk niset** — me qëllim. Një çelës i parazgjedhur
do të thoshte që kushdo që lexon këtë kod mund të nënshkruajë token-a për
cilindo përdorues.

### 4. Instalo dhe nis

Te faqja e aplikacionit shtyp **Run NPM Install**, pastaj **START**.

Kontrolli i parë:

```
https://api.artegogo.al/health
→ {"ok":true,"time":"..."}
```

Nëse kthen `ok:false`, kredencialet e databazës janë gabim.

---

## Endpoint-et

**Hyrja** — `POST /auth/register`, `POST /auth/login`, `GET|PUT /auth/me`

**Përmbajtja** (pa hyrje) — `/content/techniques`, `/categories`,
`/meditations`, `/meditations/:id`, `/sounds`, `/programs`,
`/programs/:slug/days`, `/feed`, `/quotes/today`

**Të dhënat personale** (me token) — `/me/sessions`, `/me/streak`, `/me/medals`,
`/me/favorites`, `/me/downloads`, `/me/reminders`, `/me/habits`, `/me/moods`,
`/me/journey`

**Audio** — `GET /audio/:meditationId` → lidhje e nënshkruar, ose `402` nëse
kërkon abonim

Token-i dërgohet si `Authorization: Bearer <token>`.

---

## Vendimet që mbajnë sigurinë

### Kjo API zëvendëson Row Level Security

Te versioni Postgres, **databaza vetë** ndalonte një përdorues të lexonte të
dhënat e tjetrit — 44 politika që vlenin edhe kur kodi kishte gabim. MySQL nuk
e ka.

Prandaj rregulli këtu është absolut: **çdo query mbi të dhëna personale mban
`user_id = ?`**, dhe ai `user_id` vjen gjithmonë nga token-i (`req.userId`),
kurrë nga trupi i kërkesës. Një i harruar në një rrugë të vetme do të thoshte
që kushdo lexon zakonet dhe historikun e të tjerëve — pa asnjë gabim, pa asnjë
shenjë.

Kjo verifikohet automatikisht: shih më poshtë.

### Metadata publike, audio e mbrojtur

`audio_url` **nuk kthehet nga asnjë rrugë e përmbajtjes**. Biblioteka i tregon
të 244 meditimet me dryn — kjo është vetë poenta e paywall-it — ndërsa skedari
jepet vetëm nga `/audio/:id`, pas kontrollit të abonimit, si lidhje e
nënshkruar që skadon pas një ore.

Nënshkrimi përfshin edhe `userId`: një lidhje e kopjuar nuk vlen për llogari
tjetër.

### Fushat e abonimit nuk shkruhen nga klienti

`PUT /auth/me` pranon vetëm `name`, `avatar_url`, `timezone` dhe
`onboarding_completed`. Një `UPDATE users SET ?` me trupin e kërkesës do të
lejonte këdo të dërgonte `is_premium: true` dhe të hapte katalogun falas.

### Data e seancës llogaritet te serveri

`local_date` nxirret nga zona kohore e përdoruesit në server, jo merret nga
klienti: një telefon me orë të gabuar — ose një kërkesë e ndërtuar me dorë —
do të mund të shpikte ditë dhe të fryhte streak-un.

### Një ndalesë në ditë zbatohet edhe këtu

Rregulli i rrugëtimit nuk mbetet vetëm te aplikacioni: pa kontrollin te
serveri, një kërkesë e përsëritur do ta mbaronte programin 7-ditor brenda një
minute.

### CommonJS, jo ES modules

Passenger-i i cPanel-it e mbështet pa konfigurim shtesë. `type: module` kërkon
rregullime që ndryshojnë sipas hostit dhe është shkaku më i shpeshtë i
"app failed to start".

### `bcryptjs`, jo `bcrypt`

I dyti kërkon kompilim native, që në hosting të përbashkët zakonisht dështon.
Ky është pak më i ngadaltë, por punon kudo.

---

## Verifikimi

Nuk ka MySQL në makinën ku u shkrua ky kod, ndaj **endpoint-et nuk u provuan
kundër një databaze të vërtetë** — ky është kufi i vërtetë dhe po thuhet hapur.
Prova e parë e vërtetë duhet të jetë `/health` pas vendosjes.

U provua ajo që mund të provohej pa databazë — 25 kontrolle, të gjitha kaluese:

- **22 query-t** mbi të dhëna personale, të gjitha me `user_id`; të 10 tabelat
  personale të mbuluara;
- `user_id` merret nga token-i, jo nga trupi i kërkesës;
- **32 vargje SQL**, asnjë me interpolim vlerash të klientit;
- `limit` dhe `offset` kapen mes 1 dhe 100 — pa këtë, `?limit=999999` do të
  tërhiqte tërë tabelën;
- `password_hash` nuk del kurrë te përgjigjet;
- hyrja me email të panjohur dhe me fjalëkalim të gabuar japin **të njëjtin
  mesazh** — përndryshe kushdo do të zbulonte cilat email-e janë regjistruar;
- hash-imi dhe verifikimi punojnë vërtet, dhe hash bosh nuk e rrëzon serverin;
- `has_premium` kërkon edhe datën e mbarimit, jo vetëm statusin;
- pa `JWT_SECRET` nënshkrimi dështon;
- CORS nuk është `*`; gabimet e MySQL-së nuk dalin te klienti.

**Dy gabime të vetë testit, të ndrequra:** ai lexonte vetëm vargjet me backtick
— pra 11 query nga 22, dhe jepte "0 pa filtër" mbi gjysmën; dhe ngatërronte
ndërtimin e një URL-je me SQL. Numrat e mësipërm janë pas ndreqjes.

---

## Çfarë mbetet

- **Lidhja e aplikacionit** me API-në: `services/contentRepository.js` dhe
  `services/auth.js` janë të vetmit skedarë që ndryshojnë — sot lexojnë nga
  `localStorage`.
- **Paneli i admin-it** shkruan ende lokalisht; i duhen endpoint-e shkrimi.
- **Webhook-u i pagesave** (StoreKit / Play Billing) — i vetmi që shkruan
  `is_premium` dhe `subscription_end_at`.
- **Cron për njoftimet** (cPanel → Cron Jobs) që lexon `reminders` dhe dërgon
  përmes APNs/FCM.
- **Audio**: 244 × ~10 min ≈ 1,2–1,7 GB. Nëse plani nuk e mban trafikun,
  ndryshohet vetëm `signedUrl()` te `src/routes/audio.js`.
