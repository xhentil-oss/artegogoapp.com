import { useState } from "react";
import { AlertCircle, Bell, Check, CreditCard, Crown, Gift, Unlock } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padBottom } from "../../theme/responsive.js";
import { PLANS, TRIAL_DAYS, planById, planNote, planPrice, promoOpen, trialTimeline } from "../../domain/subscription.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useSession } from "../../store/SessionContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { goldButton } from "./Paywall.jsx";
import { CheckoutSheet } from "./CheckoutSheet.jsx";

/** Ikona e secilit hap të timeline-it, sipas radhës së `trialTimeline()`. */
const STEP_ICONS = { start: Unlock, remind: Bell, bill: CreditCard };

/**
 * EKRANI I PAYWALL-IT (seksioni 8).
 *
 * Zemra e tij është timeline-i i qartë me tre hapa — modeli Headspace/Calm.
 * Arsyeja nuk është zbukurim: pjesa më e madhe e ankesave për abonime vjen
 * nga përdorues që nuk e kuptuan kur nis faturimi. Kur tri datat shihen
 * përpara se të shtypet butoni, kjo pyetje nuk mbetet e hapur.
 */
export function UpsellSheet() {
  const [plan, setPlan] = useState("year");
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const { closeUpsell } = useNavigation();
  const [code, setCode] = useState("");
  const {
    subscribe,
    redeemPromo,
    purchasePlan,
    confirmCheckout,
    restorePurchases,
    subscription,
    canAdmin,
    paymentsReady,
  } = useSession();

  /**
   * Seanca e arkës, kur fushat e kartës janë hapur.
   *
   * ⚠️  Kërkesë e klientes (19 nëntor 2026): pagesa nuk duhet ta nxjerrë
   *     njeriun nga aplikacioni. Butoni nuk e mbyll më fletën me sukses — e
   *     ndërron me arkën, dhe mbyllja vjen vetëm pasi Stripe e konfirmon.
   */
  const [arka, setArka] = useState(null);

  /*
   * Kutia e kodit shfaqet VETËM brenda dritares së fushatës.
   *
   * ⚠️  Jashtë saj nuk ka pse të ekzistojë: do të ishte një fushë që refuzon
   *     çdo gjë që shkruhet në të, dhe njerëzit do të kërkonin kode që askush
   *     nuk i jep më. Fjalën e fundit e ka serveri — kjo vendos vetëm pamjen.
   *
   * ⚠️  Administratorja e sheh edhe para 5 dhjetorit, që fushata të provohet
   *     para se të nisë e jo ditën kur nis. Serveri e lejon po ashtu, vetëm
   *     për `is_admin`.
   */
  const promo = promoOpen() || canAdmin;

  /**
   * A është përdorur tashmë prova?
   *
   * ⚠️  Serveri e refuzon provën e dytë me 409 (`trial_used_at`). Pa këtë
   *     dallim, një përdorues që e ka mbaruar provën shihte si të vetmin buton
   *     "Fillo provën falas" — dhe shtypja e tij kthente një gabim pa dalje.
   */
  const provaEPerdorur = Boolean(subscription?.trialUsed);

  /* "çdo muaj" / "çdo vit" — kushtet poshtë butonit e ndjekin planin e zgjedhur. */
  const perioda = plan === "month" ? "çdo muaj" : "çdo vit";

  useBodyScrollLock();

  /*
   * Fletja mbyllet VETËM pasi blerja konfirmohet.
   *
   * Më parë mbyllej menjëherë, sepse abonimi shkruhej drejt në ruajtje. Me
   * dyqanin e vërtetë, midis shtypjes dhe konfirmimit ka pritje — dhe një
   * pagesë e refuzuar duhet të lërë përdoruesin këtu, me arsyen përpara syve,
   * jo ta nxjerrë jashtë sikur gjithçka shkoi mirë.
   */
  const confirm = async () => {
    if (busy) return;
    setBusy("buy");
    setNotice(null);
    const result = await subscribe(plan);
    setBusy(null);

    if (result?.clientSecret) setArka(result);
    else if (result?.ok) closeUpsell();
    else setNotice(result?.error ?? "Blerja nuk përfundoi. Provo sërish.");
  };

  /**
   * Blerja e drejtpërdrejtë, pa kaluar nga prova.
   *
   * ⚠️  Te versioni web kjo NUK merr para dhe nuk pretendon se merr:
   *     `services/billing.purchase` kthen "pagesat kalojnë përmes App Store /
   *     Google Play", dhe ai mesazh shfaqet këtu. Butoni ekziston sepse rruga
   *     duhet të jetë e dukshme — jo sepse pagesa është gati.
   */
  const paguaj = async () => {
    if (busy) return;
    setBusy("buy");
    setNotice(null);
    const result = await purchasePlan(plan);
    setBusy(null);

    if (result?.clientSecret) setArka(result);
    else if (result?.ok) closeUpsell();
    else setNotice(result?.error ?? "Pagesa nuk përfundoi. Provo sërish.");
  };

  const aktivizoKodin = async () => {
    if (busy) return;
    setBusy("promo");
    setNotice(null);
    const result = await redeemPromo(code);
    setBusy(null);

    if (result?.ok) closeUpsell();
    else setNotice(result?.error ?? "Kodi nuk u pranua.");
  };

  const restore = async () => {
    if (busy) return;
    setBusy("restore");
    setNotice(null);
    const result = await restorePurchases();
    setBusy(null);

    if (result?.ok) closeUpsell();
    else setNotice(result?.reason ?? "Nuk u gjet asnjë abonim për këtë llogari.");
  };

  /*
   * Arka merr tërë fletën, nuk shtohet poshtë saj.
   *
   * ⚠️  Planet, timeline-i dhe kutia e kodit zhduken me qëllim: dy vendime të
   *     hapura njëkohësisht — "cilin plan" dhe "cila kartë" — e rrisin
   *     braktisjen pikërisht te hapi i fundit. Shigjeta mbrapa i kthen.
   */
  if (arka) {
    return (
      <CheckoutSheet
        session={arka}
        /* ⚠️  LEXOHET NGA SEANCA, JO NGA `provaEPerdorur`. Dy butona hapin të
               njëjtën arkë me kushte të ndryshme; teksti duhet të tregojë atë
               që sapo u shtyp, jo atë që llogaria mund të kishte. */
        plan={
          arka.skipTrial
            ? `${planById(plan).price} · tarifohet sot · anulo kurdo te Profili`
            : `${TRIAL_DAYS} ditë falas, pastaj ${planById(plan).price} · anulo kurdo te Profili`
        }
        onBack={() => setArka(null)}
        onDone={async (sessionId) => {
          await confirmCheckout(sessionId);
          closeUpsell();
        }}
      />
    );
  }

  return (
    <div
      onClick={closeUpsell}
      className="ag-fullscreen"
      style={{
        zIndex: 70,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fadeIn .25s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ag-sheet"
        style={{
          width: "100%",
          maxWidth: layout.sheetMaxWidth,
          background: "#fff",
          borderRadius: `${radii.sheet}px ${radii.sheet}px 0 0`,
          padding: `26px 26px ${padBottom(26)}`,
          maxHeight: "92%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.line, margin: "0 auto 22px" }} />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Crown size={34} color={T.gold} style={{ marginBottom: 10 }} />
          {/*
            ⚠️  NUK E PËRMEND PROVËN KUR ËSHTË PËRDORUR. Titulli rrinte
                «Provoje 3 ditë falas» edhe për dikë që i kishte marrë tashmë
                tri ditët — një ofertë që serveri do ta refuzonte me 409.
                Klientja e kërkoi më 20 nëntor 2026: pasi prova të jetë
                konsumuar, ekrani çon drejt te abonimi.
          */}
          <h2 style={{ color: T.ink, fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>
            {provaEPerdorur ? "Hap gjithë katalogun" : `Provoje ${TRIAL_DAYS} ditë falas`}
          </h2>
          {/*
            ⚠️  PA NUMËR. Këtu shkruhej "244 meditime" — numër i ngurtë që nuk e
                dinte sa ishin vërtet: pas fshehjes së vendmbajtësve (11 nëntor
                2026) të dukshmet mbetën 69, dhe teksti premtonte katërfishin.
                Klientja e hoqi më 16 nëntor 2026. Nëse numri kthehet ndonjëherë,
                duhet të vijë nga `listMeditations().length`, jo i shkruar me dorë.
          */}
          <p style={{ color: T.sub, fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
            I gjithë katalogu hapet me abonim — meditime, programe dhe tinguj.
          </p>
        </div>

        {/* Timeline-i tregon tri ditët dhe ditën e tarifimit. Për një llogari
            që e ka përdorur provën, ai nuk përshkruan asgjë që do të ndodhë. */}
        {!provaEPerdorur && <Timeline subscription={subscription} />}

        <div style={{ display: "flex", gap: 10, margin: "24px 0 16px" }}>
          {PLANS.map((option) => (
            <PlanOption
              key={option.id}
              option={option}
              selected={plan === option.id}
              onSelect={() => setPlan(option.id)}
            />
          ))}
        </div>

        {notice && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,90,110,0.10)",
              border: `1px solid ${T.live}55`,
              borderRadius: radii.md,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          >
            <AlertCircle size={15} color={T.live} style={{ flexShrink: 0 }} />
            <span style={{ color: T.ink, fontSize: 12.5, lineHeight: 1.45 }}>{notice}</span>
          </div>
        )}

        {/*
          DY RRUGË, jo një (kërkesë e klientes, 8 tetor 2026).

          Kur prova nuk është përdorur, ajo mbetet veprimi kryesor dhe pagesa e
          drejtpërdrejtë rri poshtë saj. Kur është përdorur, pagesa bëhet
          kryesorja dhe prova nuk shfaqet fare — një buton që serveri do ta
          refuzonte me 409 nuk duhet të ftojë askënd.
        */}
        <button
          onClick={provaEPerdorur ? paguaj : confirm}
          disabled={Boolean(busy)}
          style={{ ...goldButton, padding: 15, fontSize: 15, opacity: busy ? 0.6 : 1 }}
        >
          {busy === "buy"
            ? "Duke hapur pagesën…"
            : provaEPerdorur
              ? `Paguaj tani · ${planById(plan).price}`
              : `Fillo provën ${TRIAL_DAYS}-ditore falas`}
        </button>

        {!provaEPerdorur && (
          <button
            onClick={paguaj}
            disabled={Boolean(busy)}
            style={{
              ...sx.bareButton,
              width: "100%",
              marginTop: 12,
              padding: 13,
              borderRadius: radii.pill,
              border: `1px solid ${T.line}`,
              background: T.bg,
              color: T.ink,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Paguaj tani · {planById(plan).price}
          </button>
        )}

        {promo && (
          <div
            style={{
              marginTop: 16,
              border: `1px solid ${T.line}`,
              borderRadius: radii.md,
              padding: 14,
              background: T.bg,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Gift size={16} color={T.gold} style={{ flexShrink: 0 }} />
              <span style={{ color: T.ink, fontSize: 14, fontWeight: 700 }}>Ke një kod dhuratë?</span>
            </div>
            <p style={{ color: T.sub, fontSize: 12.5, lineHeight: 1.5, margin: "0 0 10px" }}>
              Hap gjithçka falas deri më 5 janar 2027. Një kod, një llogari.
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={code}
                /* Kodet janë me shkronja të mëdha; shkrimi i vogël nuk duhet
                   të jetë arsye që dikush të dëgjojë "kod i pavlefshëm". */
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
                /* ⚠️  SHEMBULLI NUK ËSHTË KURRË NJË KOD I VËRTETË.
                       Këtu qëndroi për pak `4657BAC8` — kodi i parë i listës —
                       dhe ai do të shkonte te çdo telefon si dhuratë falas për
                       të parin që e provonte. Vargu më poshtë nuk ekziston te
                       asnjë nga 300 kodet. */
                placeholder="P.SH. AB12CD34"
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Kodi i muajit falas"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "11px 12px",
                  borderRadius: radii.md,
                  border: `1px solid ${T.line}`,
                  background: "#fff",
                  color: T.ink,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  outline: "none",
                }}
              />
              <button
                onClick={aktivizoKodin}
                disabled={Boolean(busy) || code.length < 8}
                style={{
                  ...sx.bareButton,
                  padding: "11px 16px",
                  borderRadius: radii.md,
                  background: T.ink,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  opacity: busy || code.length < 8 ? 0.45 : 1,
                  cursor: busy || code.length < 8 ? "default" : "pointer",
                }}
              >
                {busy === "promo" ? "Pritni…" : "Aktivizo"}
              </button>
            </div>
          </div>
        )}

        {/*
          KUSHTET — pranë butonit, jo pas një lidhjeje.

          ⚠️  U HOQËN më 18 nëntor 2026 sepse premtonin një faturim që ende nuk
              ekzistonte, dhe KTHEHEN tani që ekziston (19 nëntor 2026).

          ⚠️  NUK ËSHTË ZBUKURIM LIGJOR. Tri gjëra duhen të dukshme para
              shtypjes: sa zgjat prova, sa tarifohet pastaj, dhe se rinovohet
              vetvetiu. Mungesa e tyre është shkak refuzimi te dyqanet, dhe te
              BE-ja e bën abonimin të anulueshëm pa afat. Teksti ndjek planin e
              zgjedhur — një fjali e ngurtë "228€" mbi një plan mujor do të
              ishte e pavërtetë.
        */}
        <p
          style={{
            color: T.faint,
            fontSize: 11.5,
            lineHeight: 1.5,
            margin: "14px 0 0",
            textAlign: "center",
          }}
        >
          {!paymentsReady
            ? `Prova zgjat ${TRIAL_DAYS} ditë dhe nuk kërkon kartë. Pagesat hapen së shpejti.`
            : provaEPerdorur
              ? `Tarifohesh ${planById(plan).price} dhe abonimi rinovohet vetvetiu ${perioda}.`
              : `Prova zgjat ${TRIAL_DAYS} ditë. Karta regjistrohet tani, por tarifohet ` +
                `${planById(plan).price} vetëm ditën e ${TRIAL_DAYS + 1}-të, nëse nuk e ke ` +
                `anuluar. Pastaj rinovohet vetvetiu ${perioda}.`}
          {paymentsReady && (
            <>
              <br />
              Anulo kurdo te Profili — aksesi vazhdon deri në fund të periudhës së paguar.
            </>
          )}
        </p>

        {/* Apple e kërkon si veprim më vete: kush ndërron telefon duhet ta
            rifitojë aksesin pa paguar dy herë. */}
        <button
          onClick={restore}
          disabled={Boolean(busy)}
          style={{ ...sx.bareButton, color: T.sub, width: "100%", marginTop: 14, fontSize: 13.5, fontWeight: 600 }}
        >
          {busy === "restore" ? "Duke kërkuar…" : "Rikthe një blerje të mëparshme"}
        </button>

        <button
          onClick={closeUpsell}
          style={{ ...sx.bareButton, color: T.faint, width: "100%", marginTop: 10, fontSize: 14 }}
        >
          Ndoshta më vonë
        </button>
      </div>
    </div>
  );
}

/** Tre hapat e provës, të lidhur me një vijë vertikale. */
function Timeline({ subscription }) {
  const steps = trialTimeline(subscription);

  return (
    <div>
      {/*
        ⚠️  Vija lidhëse u hoq.
            Sfondi i rrathëve është gjysmë-tejdukshëm (`rgba(...,0.16)`), ndaj
            ajo shihej NËPËR ta — dukej si një vijë e prerë mbi ikonat, jo si
            lidhje mes tyre. Zgjidhja "ta bënim sfondin të plotë" do ta hiqte
            butësinë e ngjyrës; radha e hapave lexohet gjithsesi nga etiketat
            "Sot / Dita 2 / Dita 3".
      */}
      {steps.map((step, i) => {
        const Icon = STEP_ICONS[step.id];
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} style={{ display: "flex", gap: 14, marginBottom: isLast ? 0 : 18, position: "relative" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                /* Hapi i kryer mbushet plot — dallohet pa lexuar datën. */
                background: step.done ? T.gold : isLast ? T.bg2 : "rgba(224,169,60,0.16)",
                border: `1.5px solid ${step.done ? T.gold : isLast ? T.line : T.gold}`,
              }}
            >
              {step.done ? (
                <Check size={16} color="#fff" strokeWidth={3} />
              ) : (
                <Icon size={16} color={isLast ? T.sub : T.gold} />
              )}
            </div>

            <div style={{ paddingTop: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: T.ink, fontSize: 14.5, fontWeight: 800 }}>{step.title}</span>
                <span style={{ color: T.faint, fontSize: 11.5, fontWeight: 600 }}>{step.day}</span>
              </div>
              <div style={{ color: T.sub, fontSize: 12.5, marginTop: 2, lineHeight: 1.45 }}>
                {step.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Kartelë plani me shenjë të qartë zgjedhjeje — ✓ ari kur është aktive. */
function PlanOption({ option, selected, onSelect }) {
  const price = planPrice(option);

  return (
    <button
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      aria-label={`Plani ${option.label}, ${option.price}`}
      style={{
        flex: 1,
        background: selected ? "rgba(224,169,60,0.10)" : T.bg2,
        border: `2px solid ${selected ? T.gold : T.line}`,
        borderRadius: radii.lg,
        padding: "16px 14px",
        cursor: "pointer",
        textAlign: "left",
        position: "relative",
      }}
    >
      {option.best && (
        <span
          style={{
            position: "absolute",
            top: -9,
            right: 12,
            background: T.gold,
            color: T.ink,
            fontSize: 9,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 10,
            letterSpacing: 0.3,
          }}
        >
          MË E MIRA
        </span>
      )}

      {/* Shenja e zgjedhjes rri gjithmonë në të njëjtin vend: pa vendin e
          rezervuar, kartelat do të kërcenin sa herë ndërrohej plani. */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `2px solid ${selected ? T.gold : T.line}`,
          background: selected ? T.gold : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        {selected && <Check size={12} color="#fff" strokeWidth={3.5} />}
      </div>

      <div style={{ color: T.sub, fontSize: 12, marginBottom: 3 }}>{option.label}</div>

      {/*
        Dy rreshta me të zeza te vjetori: totali, dhe sa bie në muaj.

        18px, jo 21: "228€/vjetore" me 21px matet 120 px, ndërsa kartela te një
        telefon 360 px ka vetëm 117 px të lira — pra do të thyhej pas vizës,
        "228€/" mbi "vjetore". Të dyja kartelat e marrin të njëjtën masë, që
        çmimet të rrinë në një lartësi.
      */}
      <div style={{ color: T.ink, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>
        {price.main}
      </div>
      {price.sub && (
        <div style={{ color: T.ink, fontSize: 13, fontWeight: 700, marginTop: 1 }}>
          {price.sub}
        </div>
      )}

      <div style={{ color: T.faint, fontSize: 11, marginTop: 2 }}>{planNote(option)}</div>
    </button>
  );
}
