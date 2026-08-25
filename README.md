# Arte Gogo

Aplikacion meditimi — React 18 + Vite.

```bash
npm install     # kujdes: npm-i global ka `omit=dev`; .npmrc e anashkalon
npm run dev     # http://localhost:5173
npm run build   # prodhim → dist/
npm run lint    # ESLint (0 gabime, 0 paralajmërime)
```

---

## Parimi organizues

Kodi ndahet sipas **shtresave**, jo sipas llojit të skedarit. Rregulli i vetëm
që mban gjithçka bashkë:

> Një shtresë njeh vetëm shtresat nën të. Kurrë mbi.

```
features/      ekranet — çfarë sheh përdoruesi
components/    pjesë të riciklueshme UI
store/         gjendja (React Context)
hooks/         sjellje e riciklueshme
services/      kufiri me botën e jashtme  ← backend-i hyn KËTU
domain/        logjika e biznesit, pa React
data/          përmbajtja seed
lib/ theme/    ndihmësa dhe token-e
```

Nëse një skedar në `domain/` do të importonte diçka nga `features/`, diçka
është ngatërruar.

---

## Ku shkon çfarë

| Duhet të… | Preke këtë |
|---|---|
| ndryshosh një ngjyrë, radius, hije | `theme/tokens.js` |
| shtosh një meditim, kategori, program | `data/*.js` |
| ndryshosh 8 praktikat ose 4 fushat e jetës | `data/practices.js` · `data/lifeAreas.js` |
| ndryshosh si zgjidhen meditimet | `services/contentRepository.js` |
| ndryshosh si montohet një seancë | `domain/sequence.js` |
| shtosh një ekran të ri | `features/<emri>/` + `App.jsx` + `config/navigation.js` |
| shtosh gjendje globale | `store/` (kontekst i ri ose ekzistues) |
| **lidhësh backend-in** | `services/` — dhe vetëm aty |

---

## Shtresat në detaje

### `theme/`
Token-et janë burim i vetëm i së vërtetës. `cssVariables.js` i kopjon në
`:root` si CSS variables, që `styles/*.css` të përdorë të njëjtat ngjyra pa i
dublikuar. `styles.js` mban blloqet e stilit që përsëriten në 3+ vende
(`sx.card`, `circle()`, `pill()`), jo çdo stil.

### `data/`
Përmbajtja statike. Asnjë komponent nuk e importon direkt — gjithmonë përmes
`services/contentRepository.js`. Kjo e bën ndërrimin me API një ndryshim në një
skedar të vetëm.

### `domain/`
Logjikë e pastër, e testueshme pa DOM:
- `intent.js` — kërkim i sigurt i meta-ve të një qëllimi
- `sequence.js` — montim, rirenditje, llogaritje kohe të një seance
- `search.js` — filtrimi i katalogut

### `services/`
- **`storage.js`** — ruajtje key–value. API-ja është `async` me qëllim: kur të
  kalojë në backend, ndryshon vetëm ky skedar.
  *(Kodi origjinal thërriste `window.storage` — API e artifact-eve të Claude-it
  që nuk ekziston në një app të vërtetë; zakonet e gjendjet nuk ruheshin fare.)*
- **`contentRepository.js`** — i vetmi vend ku lexohet përmbajtja.

### `store/`
Katër kontekste, secili me një përgjegjësi:

| Kontekst | Mban |
|---|---|
| `SessionContext` | përdoruesi, premium, admin |
| `NavigationContext` | skeda, kategoria, folderi, overlay-t |
| `ProgressContext` | historiku, zakonet, gjendja emocionale |
| `PlayerContext` | sekuenca aktive, mini-player, përmbyllja |

Rendi në `AppProviders.jsx` ka kuptim: `Player` konsumon `Navigation` dhe
`Progress`, ndaj qëndron më i brendshmi.

### `hooks/`
`usePlayback` është çelësi i pastërtisë: bashkon *"a është e kyçur"* +
*"hap upsell-in"* + *"nis player-in"* në një thirrje. Prandaj asnjë kartelë
nuk merr më props `isPremium` / `onUpsell` / `onPlay`.

---

## Si lidhet backend-i

**1. Përmbajtja** — bëj funksionet e `contentRepository.js` async:

```js
export const listBlocks = () => http.get("/meditations");
```

Shto `hooks/useResource.js` që mban `{ data, loading, error }`, dhe ekranet
kalojnë nga `listBlocks()` në `useResource(listBlocks)`. Asgjë tjetër.

**2. Ruajtja** — zëvendëso brendësinë e `services/storage.js` me thirrje
`/me/tracking`. Nënshkrimi async nuk ndryshon, ndaj `ProgressContext` mbetet
i paprekur.

**3. Autentikimi** — `SessionContext.login()` bëhet `POST /auth/login`,
`user` mbushet nga `/me`. Konsumatorët nuk ndryshojnë.

**4. Abonimi** — `SessionContext.subscribe()` bëhet Stripe checkout.

**5. Audio reale** — zëvendëso `hooks/useDemoAudio.js` me një hook që drejton
`<audio>`. `usePlayerEngine` e përdor përmes të njëjtit `{ play, stop }`.

---

## Çfarë mbetet vend-mbajtëse

Të gjitha të mbledhura që të zhduken lehtë:

- **`lib/placeholders.js`** — vlerësimet (`4.6★`), autorët dhe sekondat në
  kartela janë të trilluara nga indeksi. Kur API të kthejë `rating` dhe
  `instructor` realë, fshije skedarin.
- **`hooks/useDemoAudio.js`** — tone të gjeneruara, jo meditime të regjistruara.
- **`data/tracking.js` → `SEED_HISTORY`** — historik demo.
- **`features/admin/AdminPanel.jsx`** — struktura gati, veprimet jo të lidhura.
- **Navigimi** — bazuar në gjendje, jo URL. Për deep links dhe butonin "back"
  të browser-it, zëvendëso brendësinë e `NavigationContext` me `react-router`;
  API-ja publike (`goToTab`, `openCategory`, …) mund të mbetet e njëjtë.

---

## Identiteti vizual

Paleta ndjek specifikimin e brand-it dhe është e mbyllur në
[tokens.js](src/theme/tokens.js) me rolin e secilës ngjyrë si koment:

| Roli | HEX | Token |
|---|---|---|
| Sfondi | `#FFFFFF` | `T.bg` |
| Sfond dytësor | `#F7F7F9` | `T.bg2` |
| Teksti kryesor | `#0E0E12` | `T.ink` |
| Teksti dytësor | `#6B6B76` | `T.sub` |
| Teksti i zbehtë | `#9A9AA4` | `T.faint` |
| Vija/kufij | `#ECECF0` | `T.line` |
| Violet | `#7C5CE0 → #5A8CE0` | `T.eve1` / `T.eve2` |

**Aurora** — [`AuroraBackdrop`](src/components/layout/AuroraBackdrop.jsx):
shiriti i zbehtë turkez/lejla/blu në krye të çdo ekrani, që shkrihet në të
bardhë brenda ~420px. Vendoset një herë te `AppShell`, ndaj shfaqet
automatikisht në të pesë skedat dhe nuk mund të harrohet kur shtohet një
ekran i ri.

> Shiriti i gjelbër i bibliotekës u hoq — specifikimi kërkon sfond të bardhë
> me aurorë në krye të **çdo** ekrani.

Dy detaje që duken vetëm kur matet: rrezet vertikale të elipsave janë >100%,
sepse `transparent` te 76% e rrezes e shuan ngjyrën shumë para skajit — me
vlera më të vogla aurora zbardhej te 140px në vend të 420px. Shkrirja
përfundimtare bëhet me `mask-image`, jo me një gradient të bardhë sipër, që
të funksionojë edhe kur sfondi poshtë nuk është i bardhë.

## Katalogu

Përmbajtja pasqyron **ArteGogo Katalogu.pdf**: 15 kategori · 244 meditime ·
4 programe. Numrat në UI (`244 meditime · 15 kategori`) llogariten nga të
dhënat, nuk shkruhen me dorë — nuk mund të dalin jashtë sinkronit.

Dy shtresat e shfletimit që kërkon katalogu:

| Seksioni | Ku | Çfarë bën |
|---|---|---|
| **Eksploro praktikat** | Meditime | 8 modalitete (SI e bën) → hap folderin e koleksionit |
| **Kërko sipas kategorive** | Programe | 4 fusha jete (Mendja · Shpirti · Trupi · Biznesi) → filtron programet |

Ndarja: 8 nga 15 kategoritë janë *modalitete* (meditim, frymëmarrje, EFT…) dhe
dalin te "Eksploro praktikat"; 7 të tjerat janë *situacionale* (Emergjencë,
Për Çdo Moment, Shëndet…) dhe rrinë te grid-i i kategorive.

> ⚠️ Me vetëm 4 programe, çdo fushë jete ka 1–2 rezultate
> (Mendja 1 · Shpirti 2 · Trupi 1 · Biznesi 1). Filtri është gati; shto
> programe te `data/catalog.js` që të mbushet.

## Asnjë buton dekorativ

Çdo kontroll i dukshëm bën diçka. `SectionHead` e ruan këtë strukturalisht:
`action` kërkon `onAction`, përndryshe teksti del si `hint` — jo si lidhje.

Kartelat janë **një buton i vetëm**, kapak dhe etiketë bashkë. Më parë etiketa
rrinte jashtë butonit, ndaj klikimi mbi emrin — pika më e natyrshme e prekjes —
nuk bënte asgjë.

Veprimet e feed-it pa backend zgjidhen në klient: **Shpërndaj** përdor
`navigator.share` (fleta native në telefon) me kopjim si rrugëdalje;
**⋯** hap menu me "Kopjo tekstin"/"Shpërndaj"; **Komento** ruan komentin
lokalisht — i njëjti model si zakonet dhe gjendja emocionale, dhe UI-ja e
thotë hapur ("ruhen në këtë pajisje derisa të lidhet serveri").

## Mobile

Aplikacioni është ndërtuar për telefon dhe testuar nga **320px deri 1440px**.

### Korniza

Aplikacioni **nuk shtrihet** në desktop: mbetet kolonë sa një telefon
(`layout.frameWidth = 480px`), e centruar, me sfond neutral përreth.

Fletët `position: fixed` (player, folder, kërkim, admin) dhe nav-i i poshtëm
ankorohen te viewport-i, ndaj **nuk e trashëgojnë** `max-width` të prindit —
kufizohen njësoj në `.ag-frame` / `.ag-fullscreen` te
[global.css](src/styles/global.css). Centrimi bëhet me `left/right: 0` plus
`margin-inline: auto`, **jo** me `transform`, që të mos përplaset me
animacionin `slideUp` të fletëve.

Për të ndryshuar gjerësinë e aplikacionit në desktop, ndrysho vetëm
`layout.frameWidth` në [tokens.js](src/theme/tokens.js).

### Tre mjetet
Të gjitha jetojnë në [`theme/responsive.js`](src/theme/responsive.js) — pa media query:

| Mjeti | Çfarë bën |
|---|---|
| `CARD_WIDTH.*` | `min(300px, 92%)` — kartela tkurret në telefon dhe lë të dukshme buzën e kartelës tjetër (sinjali që rreshti rrëshqet) |
| `autoGrid(min)` | grid që shton kolona vetë: 2 folderë në telefon, 4 në kornizë të plotë |
| `padTop/padBottom` | `env(safe-area-inset-*)` — notch dhe shiriti i gjesteve |

**Përqindje, jo `vw`.** Përmasat matet ndaj *enës*, jo ndaj ekranit. Me `vw`
një kartelë `82vw` bëhet 459px kur dritarja është 560px — më e gjerë se
hapësira e brendshme e kornizës (444px) — dhe kartelat ngjiten pas buzës.

Kapakët përdorin `aspectRatio` në vend të lartësisë fikse: kur gjerësia tkurret,
proporcioni mbetet. Titujt e mëdhenj përdorin `clamp()`.

### Kurthi i scroll-snap

Rreshtat horizontale kanë `scrollPaddingLeft` të barabartë me `gutter`-in —
nuk është zbukurim. Me `scroll-snap-type: mandatory` dhe
`scroll-snap-align: start`, browser-i rreshton buzën e kartelës me buzën e
*scrollport*-it dhe kështu **gëlltit padding-un e majtë**: kartelat ngjiten
pas buzës ndërsa titujt mbeten 18px brenda. `scroll-padding` e shtyn
snapport-in brenda dhe hapësira ruhet.

### Çfarë u fortesua për telefon

- **`100dvh` në vend të `100vh`** (`.ag-viewport`, `.ag-fullscreen` në
  [global.css](src/styles/global.css)). `100vh` në mobile përfshin shiritin e
  URL-së: përmbajtja pritej dhe kërcente kur shiriti fshihej.
- **Input-et 16px.** Nën 16px Safari-t i iOS-it zoom-on faqen automatikisht
  sa herë prek një fushë kërkimi.
- **Bllokim i scroll-it prapa fletëve** —
  [`useBodyScrollLock`](src/hooks/useBodyScrollLock.js), me numërator që mban
  kohën kur dy fletë hapen njëra mbi tjetrën.
- **Zona prekjeje ≥ 40px** për çdo buton (ikona mbetet 24px).
- **`touch-action: manipulation`** — heq vonesën 300ms të double-tap-it.
- **`overscroll-behavior`** — pa pull-to-refresh, dhe rrëshqitja në rreshtat
  horizontale nuk aktivizon "back" të browser-it.
- **`-webkit-text-size-adjust: 100%`** — iOS nuk e "fryn" tekstin në peizazh.

### PWA

[`manifest.webmanifest`](public/manifest.webmanifest) + ikona 192/512/maskable.
Aplikacioni instalohet me *"Shto në ekranin bazë"* dhe hapet pa shirit browser-i
(`display: standalone`). Ikonat generohen nga skripti në scratchpad — për t'i
ndryshuar, zëvendëso PNG-të në `public/`.

**Ende jo PWA i plotë:** mungon service worker, ndaj nuk punon offline. Kur të
duhet, `vite-plugin-pwa` e mbulon me konfigurim minimal.

### Verifikimi

Skanimi kontrollon **programatikisht** çdo element për tejkalim të kufirit të
djathtë (duke përjashtuar rreshtat që rrëshqitin me qëllim), çdo buton për
zonën e prekjes, dhe fontin e input-it.

| Viewport | Overflow | Jashtë kufirit | Butona < 40px | Font input | Console |
|---|---|---|---|---|---|
| 320×568 · 360×800 · 390×844 | ok | ok | ok | 16px | 0 |
| 430×932 · 768×1024 · 1440×900 | ok | ok | ok | 16px | 0 |

Përputhja e kornizës — korniza, nav-i dhe fletja e player-it, të gjitha 480px
me të njëjtin `left`/`right`, në 390 / 768 / 1440 / 1920.

Hapësira e majtë e kartelave = hapësira e banner-it (18px) dhe gjerësia e
kartelës = 300px, të matura në 320 · 390 · 480 · 544 · 560 · 640 · 768 · 1280 · 1920.

Peizazh 568×320: ok. Bllokimi i scroll-it: `hidden` me player hapur →
`visible` pas mbylljes.

---

## Konventat

- Ekranet janë `*Screen`, fletët mbi ekran `*Sheet`.
- Komentet shpjegojnë **pse**, jo **çfarë**.
- Numrat magjikë emërtohen (`EXCERPT_LENGTH`, `SEEK_STEP`, `PREVIEW_SLOTS`).
- `npm run lint` duhet të mbetet i pastër.
