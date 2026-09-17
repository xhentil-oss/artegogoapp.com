# Ngarkimi i medias te cPanel — lista e hapave

Kjo veçori lejon që imazhet dhe videot e postimeve të zgjidhen nga kompjuteri
ose galeria e telefonit, në vend që adresa të shkruhet me dorë.

Deri sa këta hapa të mos bëhen, butoni "Zgjidh imazhin" te paneli kthen një
mesazh që thotë çfarë mungon (kod 503). Asgjë tjetër nuk preket.

---

## 1. Dosja (e bërë më 17 shtator 2026)

`public_html/media/` — e krijuar nga File Manager.

Ngarko aty edhe `deploy/media.htaccess`, **i riemërtuar `.htaccess`**.
Ai ndalon ekzekutimin e skripteve në atë dosje dhe heq listimin e saj.

## 2. Skedarët e API-së

Ngarko te `artegogo-api/` (mbishkruaj ku ekziston):

| Skedari | Gjendja |
|---|---|
| `api/src/routes/media.js` | **i ri** |
| `api/app.js` | i ndryshuar (dy rreshta: `optional` + `api.use`) |
| `api/package.json` | i ndryshuar (u shtua `multer`) |
| `api/package-lock.json` | i ndryshuar |

**MOS** ngarko `node_modules` — ai ndërtohet te serveri në hapin 4.

## 3. Variablat e mjedisit

cPanel → **Setup Node.js App** → aplikacioni → *Environment variables*:

| Emri | Vlera |
|---|---|
| `MEDIA_DIR` | `/home2/appdrartegogo/public_html/media` |
| `MEDIA_BASE_URL` | `https://app.drartegogo.com/media` |
| `MEDIA_MAX_MB` | `64` |

Pa vijë pjerrëte në fund te `MEDIA_BASE_URL`; pa hapësira para ose pas vlerave.

## 4. Instalimi dhe rinisja

Te i njëjti ekran: **Run NPM Install**, pastaj **Restart**.

## 5. Prova

1. Hap `https://app.drartegogo.com/api/admin/media/status` — duhet të kthejë
   `{"ready":true,...}`. (Kërkon të jesh i futur si admin.)
2. Te paneli → Komuniteti → Pamja: "Një imazh" → *Zgjidh imazhin* → zgjidh një
   foto. Fusha e adresës duhet të mbushet vetë.
3. Publiko postimin dhe shiko feed-in.

Nëse hapi 1 kthen `503`, mesazhi thotë vetë cila nga të dyja mungon: biblioteka
(hapi 4) apo variablat (hapi 3).

---

## Aplikacioni (ndarazi nga API-ja)

Butoni te paneli vjen nga paketa e re e faqes. Ndërto me `npm run build` dhe
ngarko **përmbajtjen** e `dist/` te `public_html/` (përfshi `.htaccess`).

---

# Karuseli — hapi i dytë (17 shtator 2026)

## 1. Databaza

phpMyAdmin → zgjidh bazën → skeda **SQL** → ngjit përmbajtjen e
`mysql/14_post_media.sql` → **Go**.

Skripti krijon `community_post_media` dhe bart aty median e postimeve
ekzistuese. Është i përsëritshëm: po u rrodh dy herë, nuk dyfishon asgjë.

## 2. Skedarët e API-së

Ngarko te `artegogo-api/src/routes/` (mbishkruaj):

| Skedari | Ndryshimi |
|---|---|
| `community.js` | pranon `media: [{url, type}]` dhe i shkruan me radhë |
| `content.js` | feed-i kthen edhe listën e medias |

Pastaj **Restart** te Setup Node.js App. `npm install` NUK duhet — asnjë
bibliotekë e re.

## 3. Aplikacioni

`npm run build` dhe ngarko përmbajtjen e `dist/` te `public_html/`.

## Rendi ka rëndësi

Databaza e para. Po u ngarkua API-ja para migrimit, karuseli thjesht nuk ruhet
dhe një paralajmërim shkruhet te log-u — postimi vetë ruhet normalisht, me
imazhin e parë. Asgjë nuk prishet, por karuseli nuk punon derisa tabela të
ekzistojë.
