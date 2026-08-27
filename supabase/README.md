# Databaza — Arte Gogo (Supabase / PostgreSQL)

27 tabela, 44 politika RLS, 14 triggera, 33 prova sjelljeje.

## Si ekzekutohet

```bash
npx supabase init          # një herë
npx supabase link --project-ref <ref>
npx supabase db push       # zbaton migrimet sipas radhës
```

Migrimet janë të renditura dhe të varura nga radha:

| # | Skedari | Përmban |
|---|---------|---------|
| 1 | `20260827000100_types.sql` | 6 tipe të numëruara, `touch_updated_at()` |
| 2 | `20260827000200_users.sql` | `users`, ndihmësit e RLS, trigger-i i regjistrimit |
| 3 | `20260827000300_content.sql` | teknikat, kategoritë, meditimet, tingujt, programet |
| 4 | `20260827000400_progress.sql` | seancat, streak-u, medaljet, progresi i programeve |
| 5 | `20260827000500_personal.sql` | të preferuarat, shkarkimet, kujtesat, zakonet, gjendja, krijimet |
| 6 | `20260827000600_community.sql` | postimet, reagimet, komentet, njoftimet |
| 7 | `20260827000700_triggers.sql` | streak, medalje, vlerësime, numërues |
| 8 | `20260827000800_seed.sql` | 14 teknika, 28 kategori, 2 programe, citate, tinguj |

**Radha nuk ndryshohet.** `users` vjen para përmbajtjes sepse politikat e
përmbajtjes thërrasin `is_admin()`, dhe ai funksion lexon `users`.

---

## Devijimet nga prompt-i — dhe pse

Të gjitha janë të qëllimshme. Secila zgjidh diçka që, e zbatuar fjalë për
fjalë, do të prishej.

### 1. `users.id` nuk ka `gen_random_uuid()`

Prompt-i thotë të dyja gjërat njëherësh: `default gen_random_uuid()` te tabela,
dhe te shënimi final se `id` duhet të përkojë me `auth.uid()`. Nuk qëndrojnë
bashkë — një ID e gjeneruar vetë nuk përputhet kurrë me atë të Supabase Auth,
dhe **çdo politikë RLS do të dështonte në heshtje**: përdoruesi do të hynte dhe
nuk do të shihte asgjë nga të vetat.

`id` është çelës i huaj te `auth.users`, pa default.

### 2. Meditimet premium LEXOHEN nga të gjithë

Prompt-i propozon një politikë që i fsheh krejt nga përdoruesit falas. Kjo do
të prishte bibliotekën: aplikacioni duhet t'i tregojë të 244-ta **me dryn**,
që përdoruesi të shohë çfarë fiton me abonim. Me atë politikë, biblioteka do të
kishte 3 kartela dhe paywall-i nuk do të kishte kuptim.

Ndarja e vërtetë nuk është te rreshti, është te **audio**:

- `audio_url` mban një shteg te bucket-i privat `meditations-audio`;
- shtegu është i papërdorshëm pa *signed URL*;
- signed URL-në e jep vetëm një Edge Function, pasi kontrollon `has_premium()`.

Metadata publike, përmbajtja e mbrojtur.

### 3. `audio_url` është nullable

Klienti do t'i importojë 244 titujt shumë përpara se të regjistrohet audio. Me
`not null`, katalogu nuk mbushej dot derisa të mbaronte çdo regjistrim. Në vend
të tij ka kusht më të saktë:

```sql
check (published_at is null or audio_url is not null)
```

Importo sa të duash; **publikohet** vetëm ajo që ka audio. RLS shfaq vetëm të
publikuarat.

### 4. Kolona `is_admin` — e shtuar

Politikat e prompt-it flasin për admin ("Admins lexojnë të gjithë"), por asnjë
kolonë nuk e mban atë gjendje. Pa të, ato politika nuk shkruhen dot.

E ndryshon vetëm `service_role`; politika e `UPDATE` e ndalon përdoruesin — përndryshe
kushdo me çelësin publik do t'i shkruante vetes `is_admin = true`.

### 5. Kolona `timezone` — e shtuar

Streak-u matet në ditë. Pa zonë kohore, dita llogaritet në UTC — dhe një meditim
në orën **23:00 në Tiranë** (UTC+2) bie më 01:00 UTC të nesërmen. Përdoruesi që
mediton çdo mbrëmje do të merrte dy ditë për një, ose do t'i këputej vargu pa
arsye. Për një aplikacion shqiptar kjo prek pothuajse çdo përdorues mbrëmjeje.

### 6. `total_seconds` në vend të mbledhjes së minutave

Prompt-i kërkon `total_minutes`. Mbledhja e minutave të rrumbullakosura gabon:
gjashtë seanca nga 90 sekonda janë 9 minuta, jo 6 apo 12. Ndaj mblidhen sekondat
dhe `total_minutes` është **kolonë e gjeneruar** prej tyre — emri i mbetur i
njëjti, numri gjithmonë i saktë.

### 7. Medaljet me çelës idempotence

Prompt-i jep vetëm `medal_type` dhe `reason`. Pa një çelës unik, çdo rillogaritje
do të shtonte medalje të reja për të njëjtën arritje dhe numri "×N" do të rritej
pa fund.

`unique (user_id, medal_type, streak_start_date, streak_day)` — e njëjta arritje
shkruhet një herë, ndërsa një varg i dytë që arrin ditën 3 jep bronzin e vet,
siç e kërkon modeli i seksionit 7.

### 8. RLS edhe mbi tabelat e përmbajtjes

Prompt-i e aktivizon vetëm mbi të dhënat personale. Në Supabase **çdo tabelë e
skemës `public` ekspozohet përmes API-së**: pa RLS, kushdo me çelësin publik
`anon` mund të fshinte katalogun. RLS e fikur nuk do të thotë "vetëm lexim" — do
të thotë "pa asnjë kontroll".

### 9. Pa `create extension pgcrypto`

`gen_random_uuid()` bën pjesë në bërthamën e Postgres-it që nga versioni 13;
Supabase punon mbi 15. Ekstensioni ishte varësi e panevojshme.

### 10. Kategoritë janë 28, jo 27

Prompt-i e titullon listën "27 kategoritë" por numëron 28 emra — e njëjta
mospërputhje si te prototipi. Janë futur të 28-ta. **Kjo pret vendimin e
klientit**: fshirja e njërës pa e ditur cila do të linte meditime pa etiketë.

---

## Ende pa zgjidhur — kërkon të dhëna ose punë tjetër

- **244 meditimet** nuk janë në seed: kërkojnë tituj, teknikë, kategori dhe
  kohëzgjatje reale. Skema është gati; importi bëhet me CSV pasi klienti t'i
  japë.
- **Tre meditimet falas** (ankth / zemër / tru) duhen shënuar me
  `is_premium = false` pas importit.
- **Edge Functions** e përmendura te prompt-i nuk janë shkruar: `generate-meditation-session`,
  `send-push-notification`, `check-subscription`.
- **Storage buckets** krijohen nga paneli i Supabase, jo nga migrimet:
  `meditations-audio` (privat), `meditations-covers` (publik), `avatars` (privat).
- **Webhook-u i faturave** (StoreKit / Play Billing) është ai që shkruan
  `is_premium` dhe `subscription_end_at`. Deri atëherë ato mbeten të pandryshuara.

---

## Verifikimi

Migrimet u ekzekutuan mbi një Postgres të vërtetë (PGlite, PostgreSQL në WASM)
dhe u provuan me 33 kontrolle sjelljeje:

- regjistrimi krijon profilin, streak-un dhe tri kujtesat e fikura;
- `has_premium()` kthen `false` për abonim pa datë mbarimi dhe për të skaduarin;
- 21 ditë rresht → **7 bronz, 3 argjend, 1 ar**;
- seanca e papërfunduar nuk e prek streak-un;
- dy seanca në një ditë numërohen si një ditë;
- pas këputjes streak-u rinis nga 1, rekordi dhe medaljet mbeten;
- mesatarja e vlerësimeve rillogaritet edhe pas fshirjes;
- numëruesit e postimeve rriten dhe zbresin saktë;
- meditim i publikuar pa audio ndalohet, importi pa audio lejohet;
- zakon në të ardhmen, gjendje jashtë 1–5, ditë jave e pavlefshme dhe media pa
  lloj — të gjitha ndalohen nga databaza, jo vetëm nga aplikacioni.

`auth.uid()` u stubua për ekzekutimin; **politikat RLS nuk u provuan në sjellje**
— për këtë duhet një instancë e vërtetë Supabase me JWT.

---

## Lidhja me prototipin

Slug-et janë të njëjtë me emrat te `src/data/techniques.js` dhe
`src/data/categories.js`, që importi të bëhet pa përkthim ndërmjetës.

| Prototipi | Databaza |
|---|---|
| `t_breath` | `frymemarrje` |
| `t_eft` | `eft-tapping` |
| `t_heart` | `meditime-per-zemren` |
| `c_qetesim` | `qetesim` |
| `c_zemra` | `zemra-plot` |

Kur backend-i të lidhet, `src/services/contentRepository.js` është i vetmi
skedar që ndryshon — çdo ekran lexon vetëm prej tij.
