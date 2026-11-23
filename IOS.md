# iOS — çfarë është gati dhe çfarë mbetet

Platforma iOS u shtua më **20 nëntor 2026**, nga Windows. Gjithçka që mund
të bëhet pa Mac është bërë; pjesa tjetër kërkon macOS, sepse Xcode nuk
ekziston për Windows.

> ⚠️ **Mos e hap App Store-in para se të ndërtohet StoreKit.** Apple e kërkon
> In-App Purchase për çdo abonim dixhital dhe e refuzon një aplikacion që të
> çon te faqja për të paguar. Shih «Pagesat» më poshtë.

## Çfarë është bërë

| | |
|---|---|
| Platforma | `npx cap add ios` — projekti Xcode te `ios/App` |
| Menaxhimi i varësive | **Swift Package Manager**, jo CocoaPods — pra **nuk duhet `pod install`** |
| Emri te telefoni | `Ndiej` (`CFBundleDisplayName`, nga `capacitor.config.json`) |
| Identiteti | `com.drartegogo.artegogo` — i njëjti me Android-in |
| Ikona | `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`, 1024×1024 pa kanal alfa |
| Zëri në sfond | `UIBackgroundModes: audio` + `AVAudioSession(.playback, .spokenAudio)` te `AppDelegate.swift` |
| Eksporti i kriptimit | `ITSAppUsesNonExemptEncryption = false` — heq pyetjen te çdo ngarkim |
| Ekrani i nisjes | `Splash.imageset` — i bardhë me logon vjollcë, që të mos kërcejë ngjyra kur faqja ngarkohet |
| Lejet | `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSMicrophoneUsageDescription` — pa to app-i bie te `<input type="file">` dhe Apple e refuzon binarin |
| Vetëm iPhone | `TARGETED_DEVICE_FAMILY = "1"`. Pamja është e telefonit (shirit poshtë, fletë 460 px); e deklaruar për iPad, Apple e shqyrton atje dhe e refuzon nën 2.4.1 — dhe kërkon pamje ekrani 13-inçëshe që nuk kanë kuptim |
| Versioni | `MARKETING_VERSION`, `CURRENT_PROJECT_VERSION` — numrin e ndërtimit e vendos Codemagic |
| Ndërtimi | `npm run build:ios` → lexon `.env.ios` dhe bën `cap sync ios` |

### Pse `.env.ios` ekziston

Te faqja, `/api` zgjidhet ndaj domenit. Te aplikacioni nativ nuk ka domen —
iOS-i e shërben pakon nga `capacitor://localhost`. Pa adresën e plotë, çdo
kërkesë do të kthente 404.

⚠️ **`npm run build` (webi) dhe `npm run build:ios` shkruajnë te i njëjti
`dist/`.** Pas një ndërtimi nativ, bëj `npm run build` para se të përgatitësh
zip-in e faqes — përndryshe te `public_html` shkon pako e gabuar.

## Çfarë mbetet

### 1. Te serveri — një rresht, para provës së parë

cPanel → Setup Node.js App → `APP_ORIGIN` duhet të përmbajë **edhe**:

```
capacitor://localhost
```

të ndarë me presje nga të tjerat. Android-i niset nga `https://localhost`,
iOS-i nga `capacitor://localhost` — nuk janë e njëjta origjinë. Pa të, çdo
kërkesë nga iPhone-i bie me CORS, pa lënë asnjë gjurmë te serveri. Pas
ndryshimit duhet **Restart**.

### 2. Te Mac-u

```bash
git clone … && npm install
npm run build:ios
npx cap open ios
```

Te Xcode: Signing & Capabilities → ekipi i Apple Developer-it →
Product → Archive → Distribute App.

### 3. Llogaria — 99 USD/vit

Apple Developer Program. Si organizatë kërkohet edhe një numër **D-U-N-S**
(falas, disa ditë deri në dy javë).

### 4. Pagesat — StoreKit  ← **pengesa e vërtetë**

Nuk është ndërtuar. Sot `billing.isNative()` e ndal Stripe-in te aplikacioni
nativ dhe kthen mesazhin «Pagesat te aplikacioni kalojnë përmes App Store».
Pra brenda app-it jepet vetëm prova 3-ditore dhe asgjë nuk blihet dot.

Apple e refuzon këtë gjendje nën rregullin **3.1.1**: përmbajtja me pagesë
duhet të shitet me In-App Purchase, dhe një aplikacion që të çon te faqja për
të paguar nuk kalon.

Çfarë duhet, me radhë:

1. Llogaria Apple dhe dy produkte abonimi te App Store Connect (mujor, vjetor)
   brenda një **Subscription Group** të vetëm.
2. `APPLE_SHARED_SECRET` te cPanel → Setup Node.js App. Pa të,
   `storeVerify.js` e kthen `not_configured` dhe `/verify` përgjigjet 501.
3. Një shtojcë Capacitor për StoreKit te aplikacioni, që pas blerjes i dërgon
   faturën te `POST /me/subscription/verify`.

Serveri është gati nga ana e tij: `/verify` e pret faturën dhe vetëm pastaj
hap aksesin. Mungon ana e telefonit — dhe ajo nuk provohet dot pa Mac dhe pa
një pajisje të vërtetë.

### 5. Njoftimet

Njoftimet e sotme janë **Web Push**, me `service worker`. Brenda një
aplikacioni Capacitor te iOS kjo nuk punon fare. Duhen
`@capacitor/push-notifications` dhe një çelës **APNs** te llogaria Apple.
Deri atëherë, aplikacioni iPhone do të jetë pa njoftime.

### 6. Pamjet e ekranit

Apple kërkon 6.7" dhe 6.5". Mund të bëhen nga faqja, me shfletuesin në
përmasat e duhura — nuk duhet iPhone.

## Materiali i dyqanit

`C:\Users\emanuela\Desktop\ikonat-dyqani\` — jashtë git-it:
`ikona-1024-apple.png`, `TEKSTET-E-DYQANIT.txt` (emri 26/30, nëntitulli 30/30).
