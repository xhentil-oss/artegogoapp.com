# Databaza për cPanel — MySQL / MariaDB

29 tabela, 16 triggera, 1 pamje. Versioni Supabase/PostgreSQL rri te
[`../supabase/`](../supabase/) — nuk fshihet, në rast se rruga ndryshon.

## Instalimi te cPanel

1. **cPanel → MySQL® Databases**
   - krijo databazën, p.sh. `artegogo`
   - krijo një përdorues me fjalëkalim të fortë
   - shtoje përdoruesin te databaza me **ALL PRIVILEGES**

2. **cPanel → phpMyAdmin** → zgjidh databazën → **Import**, sipas kësaj radhe:

   | # | Skedari | Çfarë bën |
   |---|---------|-----------|
   | 1 | `01_schema.sql` | 29 tabelat, çelësat, indekset, pamja |
   | 2 | `02_triggers.sql` | 16 triggerat |
   | 3 | `03_seed.sql` | 14 teknika, 28 kategori, 2 programe, citate |

   Radha nuk ndryshohet: triggerat kërkojnë tabelat, seed-i kërkon të dyja.

3. **Kontrollo që shkronjat shqipe janë të plota.** Hap tabelën `categories`
   dhe shiko rreshtin `Përmirësimi i marrëdhënieve`. Nëse del `PÃ«rmirÃ«simi`,
   importi u bë me `latin1` — fshi databazën dhe importoje sërish duke zgjedhur
   **utf8mb4** te fusha *Character set of the file* në phpMyAdmin.

### Kërkesat minimale

| | Versioni |
|---|---|
| MySQL | 8.0.16+ (për `CHECK` dhe `DEFAULT (UUID())`) |
| MariaDB | 10.4+ |

Te MySQL 5.7 dhe MariaDB 10.1, `CHECK` shkruhet por **nuk zbatohet** — nuk jep
gabim, thjesht nuk mbron. Kontrollo versionin te faqja kryesore e phpMyAdmin.

---

## ⚠️ Çfarë humbi duke kaluar nga Postgres te MySQL

Këto nuk janë hollësi. Janë punë që dikush duhet ta bëjë.

### 1. Row Level Security nuk ekziston

Ky është ndryshimi më i rëndë. Te versioni Postgres, **databaza vetë** ndalonte
një përdorues të lexonte të dhënat e tjetrit — 44 politika që vlenin edhe kur
kodi kishte gabim.

MySQL nuk e ka këtë. Mbrojtja tani varet **tërësisht** nga API-ja: një
`WHERE user_id = ?` i harruar në një endpoint të vetëm do të thotë që kushdo
lexon zakonet, gjendjen emocionale dhe historikun e të tjerëve — pa asnjë
gabim, pa asnjë shenjë.

Rregull praktik: çdo query mbi këto 14 tabela duhet të mbajë `user_id`:

```
meditation_sessions · streaks · medals · user_program_progress
user_program_day_completions · favorites · downloads · reminders
habits · moods · creations · meditation_ratings · post_saves · notifications
```

### 2. Nuk ka autentikim të gatshëm

`auth.users` ishte i Supabase-it. Këtu ka `users.password_hash`, dhe hash-imin
duhet ta bëjë API-ja me **bcrypt** ose **argon2id**. Kurrë MD5, kurrë SHA1,
kurrë fjalëkalim i pastër.

### 3. Vargjet u bënë tabela

MySQL nuk ka `text[]`. Prandaj janë 29 tabela, jo 27:

| Postgres | MySQL |
|---|---|
| `meditations.tags text[]` | tabela `meditation_tags` |
| `user_program_progress.completed_days int[]` | tabela `user_program_day_completions` |
| `reminders.days_of_week int[]` | 7 kolona `on_mon … on_sun` |

Dy të parat dolën **më mirë**: tabela lejon indeks, dhe ruan edhe *kur* u krye
secila ditë — çka vargu nuk e mbante dot.

### 4. Dita e streak-ut vjen nga API-ja

Te Postgres, dita llogaritej me zonën kohore të përdoruesit brenda databazës.
MySQL e bën me `CONVERT_TZ()`, që kërkon tabelat e zonave kohore — dhe në
hosting të përbashkët ato **zakonisht nuk janë të ngarkuara**.

Ndaj `meditation_sessions.local_date` shkruhet nga API-ja:

```js
// API-ja e di zonën e përdoruesit nga users.timezone
const localDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: user.timezone,           // 'Europe/Tirane'
}).format(new Date());               // '2026-08-27'
```

Kjo është edhe më e saktë se `CONVERT_TZ`: mban vetvetiu edhe orën verore.

**Pa këtë fushë të mbushur saktë, streak-u del i gabuar.**

### 5. DATETIME, jo TIMESTAMP

`TIMESTAMP` i MySQL-it mbaron më **19 janar 2038**. Një abonim `lifetime` do
të kishte datë mbarimi përtej saj dhe do të dështonte në heshtje. Të gjitha
datat ruhen në **UTC**; kthimin në orën lokale e bën aplikacioni.

---

## Çfarë duhet ndërtuar tani

Databaza është vetëm gjysma. Që aplikacioni të punojë, duhet edhe:

**API-ja** (PHP ose Node te *Setup Node.js App*). Një faqe web **nuk lidhet
drejtpërdrejt** me MySQL — do të thoshte të vendosje fjalëkalimin e databazës në
kodin që shkarkon çdo vizitor. Endpoint-et minimale:

- `POST /auth/register`, `POST /auth/login` — bcrypt + JWT
- `GET /meditations`, `GET /programs`, `GET /feed`
- `POST /sessions` — **me `local_date`**
- `GET/PUT /me/favorites`, `/me/habits`, `/me/moods`, `/me/reminders`
- `GET /audio/:id` — kthen URL të nënshkruar, vetëm nëse `is_premium` ose
  meditimi është falas

**Audio.** Kjo është pengesa praktike: 244 meditime × ~10 minuta ≈ **1,2–1,7 GB**
skedarë, dhe me 1000 dëgjime në ditë rreth **150 GB trafik në muaj** — mbi kuotën
e shumicës së planeve të përbashkëta. Nëse plani yt nuk e mban, audio duhet të
shkojë te një shërbim jashtë (Bunny.net, Cloudflare R2, S3), edhe nëse databaza
mbetet te cPanel.

**Cron për njoftimet** (cPanel → Cron Jobs), që lexon `reminders` dhe dërgon
përmes APNs/FCM.

---

## Verifikimi

Nuk ka MySQL në këtë makinë, ndaj skedarët **nuk u ekzekutuan** — ky është kufi
i vërtetë i verifikimit dhe e them hapur. Versioni Postgres u ekzekutua dhe u
provua me 33 kontrolle sjelljeje; ky nuk mundi.

U bë kontroll strukturor me 18 verifikime, të gjitha kaluese:

- 29 tabela, pa emra të dyfishtë;
- çdo çelës i huaj tregon nga tabelë ekzistuese, dhe **radha e krijimit i
  respekton** — asnjë FK nuk tregon përpara;
- të 29-ta me `utf8mb4` (pa të, ë dhe ç prishen në heshtje);
- asnjë kolonë `TIMESTAMP`;
- 16 triggera, secili mbi tabelë ekzistuese, **asnjëri nuk shkruan mbi tabelën
  e vet** — kufizim i MySQL-it që do të jepte gabim gjatë importit;
- çdo `BEGIN` me `END`, çdo trigger me `DROP` paraprak, `DELIMITER` i mbyllur;
- asnjë mbetje sintakse Postgres: pa `ON CONFLICT`, `generate_series`,
  `text[]`, `CREATE POLICY`, `gen_random_uuid`.

**Hapi i parë pas importit** duhet të jetë provë e vërtetë e streak-ut: krijo një
përdorues, fut tri seanca me `local_date` në tri ditë rresht, dhe shiko që
`streaks.current_streak = 3` dhe te `medals` u shfaq një bronz. Nëse kjo punon,
punon edhe pjesa tjetër.
