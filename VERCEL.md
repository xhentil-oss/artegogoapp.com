# Vercel — kopja për t'ia treguar klientes

Aplikacioni është një faqe statike; API-ja dhe databaza rrinë te cPanel dhe
nuk zhvendosen. Vercel-i shërben vetëm pamjen.

## Pse dilte «Gabim 404»

`services/api.js` e ka bazën `/api` — pra të njëjtin origjin. Kjo është e
saktë te prodhimi (`app.drartegogo.com` i shërben të dyja) dhe e saktë te
zhvillimi (`vite.config.js` e përcjell `/api`).

Te Vercel nuk vlen asnjëra: aty ka vetëm skedarë statikë, ndaj `/api/auth/forgot`
nuk ekziston dhe kthen **404**. Nuk ishte defekt i rivendosjes së fjalëkalimit —
çdo kërkesë drejt serverit dështonte njësoj.

## Zgjidhja: `vercel.json`

Një rishkrim që e përcjell `/api/*` te serveri i vërtetë:

```json
{ "source": "/api/:path*", "destination": "https://app.drartegogo.com/api/:path*" }
```

⚠️  **Pse rishkrim dhe jo `VITE_API_URL`.** Po t'i thoshim aplikacionit të
    thërriste drejtpërdrejt `https://app.drartegogo.com/api`, shfletuesi do ta
    trajtonte si kërkesë ndër-origjine, dhe `APP_ORIGIN` te cPanel lejon vetëm
    `https://app.drartegogo.com`. Do të na duhej të zgjeronim CORS-in e
    prodhimit për hir të një kopjeje demo.

    Rishkrimi ndodh te serveri i Vercel-it, jo te shfletuesi — pra CORS-i nuk
    hyn fare në lojë, dhe konfigurimi i prodhimit mbetet i paprekur. E njëjta
    logjikë si te përcjellësi i Vite-s.

## Pas shtimit

Skedari duhet te **rrënja e projektit**, bashkë me `package.json`. Vercel-i e
lexon vetë te ndërtimi i radhës — thjesht ri-vendos.

## Çfarë punon dhe çfarë jo te kjo kopje

Punojnë: hyrja, katalogu, abonimi, zilja, fshirja e llogarisë, rivendosja e
fjalëkalimit — gjithçka që kalon nga `/api`.

⚠️  **Shkarkimi i audios ka gjasa të mos punojë** te kjo kopje. Lidhja e
    nënshkruar ndërtohet me `AUDIO_BASE_URL`, që është adresë e plotë te
    `app.drartegogo.com` — pra jashtë rishkrimit. Luajtja me `<audio>` nuk
    preket (media ndër-origjine lejohet), por `downloadAudio` përdor `fetch`,
    dhe atë e ndal CORS-i sepse Apache nuk dërgon `Access-Control-Allow-Origin`
    për skedarë statikë.

    Nëse demo-ja duhet ta ketë edhe shkarkimin, zgjidhja është të shtohet një
    rishkrim i dytë për `/meditime/*` dhe `AUDIO_BASE_URL` të bëhet relative.
    Deri atëherë, shkarkimi provohet te `app.drartegogo.com`.

## Kujtesë

Vercel-i është kopje **demonstrimi**. Vendimi mbetet: serveri i vërtetë është
cPanel-i, dhe atje shkojnë audiot, njoftimet dhe databaza.
