import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { T, layout, radii } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import { padTop, padBottom } from "../../theme/responsive.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";

/*
 * POLITIKA E PRIVATËSISË — brenda aplikacionit.
 *
 * ⚠️  Faqja publike `public/privatesia.html` NUK hiqet dhe nuk zëvendësohet.
 *
 *     Play Console-i kërkon një adresë që hapet pa aplikacionin dhe pa hyrje në
 *     llogari; shqyrtuesi e lexon aty. Kjo pamje është për klientin, që të mos
 *     dalë jashtë aplikacionit për ta lexuar (kërkesë e klientes, 22 tetor 2026).
 *
 *     Pra të dyja mbahen të njëjta në përmbajtje. Kur ndryshon njëra, ndryshon
 *     edhe tjetra — përndryshe dy tekste të ndryshme për të njëjtën premtim
 *     ligjor është pikërisht ajo që Play-i e quan mospërputhje.
 *
 * Teksti rri si të dhëna, jo si JSX i gjatë: ndryshimi i një paragrafi nuk
 * duhet të kërkojë lexim kodi.
 */
const DATA = "22 tetor 2026";
const FAQJA = "https://app.drartegogo.com/privatesia.html";
const EMAIL = "kontakt@drartegogo.com";

const MBLEDHIM = [
  {
    kategoria: "Llogaria",
    tedhenat:
      "Adresa e email-it, emri, fjalëkalimi (vetëm i koduar me hash, kurrë si tekst), numri i telefonit nëse e jep vetë, fotoja e profilit nëse e vendos, zona kohore e pajisjes.",
    pse: "Për të krijuar llogarinë, për të të futur brenda dhe për të llogaritur ditët sipas orës sate lokale.",
  },
  {
    kategoria: "Përdorimi i aplikacionit",
    tedhenat:
      "Cilat meditime dëgjon dhe sa kohë, meditimet e përfunduara, programet dhe ditët e kryera, të preferuarat, vlerësimet, zakonet, vargu i ditëve rresht, medaljet dhe meditimet që krijon vetë.",
    pse: "Për të ruajtur ecurinë tënde dhe për të të treguar historikun.",
  },
  {
    kategoria: "Gjendja shpirtërore",
    tedhenat:
      "Humori që zgjedh para dhe pas një meditimi, humori ditor, niveli i energjisë dhe shënimet që shkruan vetë.",
    pse: "Për ditarin tënd personal brenda aplikacionit. I sheh vetëm ti.",
  },
  {
    kategoria: "Njoftimet",
    tedhenat:
      "Orët e kujtesave që vendos, dhe — nëse i lejon njoftimet — adresa teknike e pajisjes te shërbimi i njoftimeve, dy çelësat e saj të enkriptimit, lloji i platformës dhe emri i shfletuesit.",
    pse: "Për të dërguar kujtesat e meditimit dhe njoftimin ditor të programit.",
  },
  {
    kategoria: "Abonimi",
    tedhenat: "Statusi i abonimit, plani, çmimi dhe datat e tij.",
    pse: "Për të ditur çfarë përmbajtjeje ke të drejtë të dëgjosh.",
  },
  {
    kategoria: "Komuniteti",
    tedhenat: "Pëlqimet, postimet që ruan dhe komentet që shkruan.",
    pse: "Për të shfaqur reagimet dhe listën tënde të të ruajturave.",
  },
];

const NUK_MBLEDHIM = [
  "Asnjë analitikë ose gjurmues të palëve të treta — pa Google Analytics, pa Facebook, pa Firebase, pa asnjë tjetër.",
  "Asnjë reklamë dhe asnjë identifikues reklamimi.",
  "Vendndodhjen tënde. Aplikacioni kërkon vetëm lejen e internetit; nuk kërkon GPS, kamerë, mikrofon, kontakte apo skedarët e telefonit.",
  "Audion tënde. Meditimet luhen te pajisja; asgjë nuk regjistrohet.",
];

const SEKSIONET = [
  {
    titulli: "1. Kush është përgjegjës për të dhënat",
    paragrafe: [
      "Kontrollues i të dhënave është pronari i aplikacionit Arte Gogo, me seli në Shqipëri.",
      `Për çdo pyetje ose kërkesë mbi të dhënat — përfshirë qasjen, korrigjimin ose fshirjen e tyre — shkruaj te ${EMAIL}.`,
    ],
  },
  {
    titulli: "3. Pagesat",
    paragrafe: [
      "Aktualisht aplikacioni nuk përpunon pagesa dhe nuk mbledh asnjë të dhënë karte: prova falas regjistrohet vetëm si status brenda llogarisë.",
      "Kur abonimet me pagesë të aktivizohen, ato do të kalojnë nëpër sistemin e pagesave të dyqanit. Numrin e kartës dhe të dhënat financiare i merr dhe i ruan dyqani, jo ne; ne marrim vetëm konfirmimin nëse abonimi është aktiv apo jo.",
    ],
  },
  {
    titulli: "4. Mbi çfarë baze ligjore i përpunojmë",
    lista: [
      "Përmbushja e kontratës — të dhënat e llogarisë, ecuria dhe abonimi janë të domosdoshme që aplikacioni të funksionojë.",
      "Pëlqimi yt — njoftimet dërgohen vetëm pasi i lejon vetë, dhe mund t'i çaktivizosh kurdo nga cilësimet.",
      "Interesi legjitim — mbajtja e sigurisë së llogarive dhe parandalimi i keqpërdorimit.",
    ],
  },
  {
    titulli: "5. Me kë ndahen të dhënat",
    paragrafe: [
      "Të dhënat nuk u shiten dhe nuk u jepen palëve të treta për reklama ose marketing. Ato u besohen vetëm dy llojeve shërbimesh, dhe vetëm aq sa duhet:",
    ],
    lista: [
      "Kompania e pritjes së serverit. Baza e të dhënave dhe skedarët ndodhen në serverë në Helsinki të Finlandës, brenda Bashkimit Evropian.",
      "Shërbimet e njoftimeve të Google, Apple ose Mozilla-s, sipas pajisjes. Atyre u kalon vetëm adresa teknike e pajisjes dhe teksti i njoftimit — asnjë e dhënë tjetër.",
    ],
    fund: "Mund t'i japim të dhënat edhe nëse na detyron ligji ose një urdhër gjykate.",
  },
  {
    titulli: "6. Sa kohë i mbajmë",
    paragrafe: [
      "Të dhënat mbahen për aq kohë sa llogaria ekziston. Sapo e fshin llogarinë, fshihet njëkohësisht çdo gjë e lidhur me të: seancat, humori, shënimet, të preferuarat, medaljet, kujtesat dhe abonimet e njoftimeve. Fshirja është e menjëhershme dhe e pakthyeshme.",
    ],
  },
  {
    titulli: "7. Si ta fshish llogarinë",
    paragrafe: [
      "Brenda aplikacionit: Profili → Fshi llogarinë. Të kërkohet fjalëkalimi si konfirmim, dhe pastaj gjithçka fshihet.",
      `Nëse nuk hyn dot në llogari, shkruaj te ${EMAIL} nga adresa me të cilën u regjistrove dhe e fshijmë ne brenda 30 ditësh.`,
      "Kujdes: nëse ke një abonim aktiv, anuloje më parë te dyqani. Fshirja e llogarisë nuk e ndalon vetvetiu faturimin.",
    ],
  },
  {
    titulli: "8. Të drejtat e tua",
    paragrafe: [
      "Ke të drejtë të kërkosh qasje te të dhënat e tua, korrigjimin, fshirjen, kufizimin ose kundërshtimin e përpunimit, dhe një kopje të tyre në format të lexueshëm. Shumicën i kryen vetë brenda aplikacionit; për të tjerat shkruaj te adresa më lart dhe përgjigjemi brenda 30 ditësh.",
    ],
  },
  {
    titulli: "9. Siguria",
    lista: [
      "Çdo komunikim mes aplikacionit dhe serverit kalon i enkriptuar me HTTPS.",
      "Fjalëkalimet ruhen vetëm si hash kriptografik; as ne nuk mund t'i lexojmë.",
      "Një llogari përdoret në një pajisje në të njëjtën kohë; hyrja nga një pajisje tjetër e mbyll sesionin e mëparshëm.",
    ],
  },
  {
    titulli: "10. Fëmijët",
    paragrafe: [
      "Aplikacioni nuk u drejtohet fëmijëve nën 16 vjeç dhe nuk mbledh me vetëdije të dhëna prej tyre. Nëse zbulojmë një llogari të tillë, e fshijmë.",
    ],
  },
  {
    titulli: "11. Ndryshimet",
    paragrafe: [
      "Nëse kjo politikë ndryshon, data lart përditësohet dhe ndryshimet e rëndësishme njoftohen brenda aplikacionit përpara se të hyjnë në fuqi.",
    ],
  },
];

const titull = { color: T.ink, fontSize: 16, fontWeight: 800, margin: "22px 0 8px" };
const teksti = { color: T.sub, fontSize: 14, lineHeight: 1.65, margin: "0 0 10px" };

function Seksioni({ seksioni }) {
  return (
    <section>
      <h2 style={titull}>{seksioni.titulli}</h2>

      {seksioni.paragrafe?.map((p) => (
        <p key={p.slice(0, 24)} style={teksti}>
          {p}
        </p>
      ))}

      {seksioni.lista && (
        <ul style={{ ...teksti, paddingLeft: 18, margin: "0 0 10px" }}>
          {seksioni.lista.map((rresht) => (
            <li key={rresht.slice(0, 24)} style={{ marginBottom: 6 }}>
              {rresht}
            </li>
          ))}
        </ul>
      )}

      {seksioni.fund && <p style={teksti}>{seksioni.fund}</p>}
    </section>
  );
}

export function PrivacySheet() {
  const { closePrivacy } = useNavigation();
  useBodyScrollLock();

  return (
    <div
      className="ag-sheet ag-fullscreen"
      style={{
        ...sx.fullSheet,
        zIndex: 57,
        padding: `${padTop(20)} ${layout.gutter}px ${padBottom(40)}`,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button onClick={closePrivacy} aria-label="Prapa" style={sx.bareButton}>
          <ArrowLeft size={24} color={T.ink} />
        </button>

        <div style={sx.flexText}>
          <div style={{ color: T.ink, fontSize: 20, fontWeight: 800 }}>Politika e Privatësisë</div>
          <div style={{ color: T.sub, fontSize: 12.5 }}>Në fuqi nga {DATA}</div>
        </div>

        <ShieldCheck size={20} color={T.gold} style={{ flexShrink: 0 }} />
      </header>

      <p style={teksti}>
        Kjo faqe shpjegon cilat të dhëna mbledh Arte Gogo, pse i mbledh, me kë
        ndahen dhe si mund t&apos;i fshish.
      </p>

      {/* Përmbledhja rri lart me qëllim: kush nuk e lexon deri në fund, le të
          marrë të paktën thelbin. */}
      <div
        style={{
          ...sx.panel,
          borderRadius: radii.lg,
          margin: "14px 0 4px",
          background: T.bgSkeleton,
        }}
      >
        <p style={{ ...teksti, margin: 0, color: T.ink }}>
          <strong>E shkurtër:</strong> Arte Gogo nuk ka reklama, nuk ka gjurmues
          dhe nuk ka asnjë mjet analitike të palëve të treta. Të dhënat e tua nuk
          shiten — kurrë. Llogarinë mund ta fshish vetë dhe bashkë me të fshihet
          çdo gjurmë e saj.
        </p>
      </div>

      <Seksioni seksioni={SEKSIONET[0]} />

      <h2 style={titull}>2. Çfarë të dhënash mbledhim</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MBLEDHIM.map((rresht) => (
          <div key={rresht.kategoria} style={{ ...sx.panel, borderRadius: radii.lg }}>
            <div style={{ color: T.ink, fontSize: 14.5, fontWeight: 800, marginBottom: 4 }}>
              {rresht.kategoria}
            </div>
            <p style={{ ...teksti, margin: "0 0 6px" }}>{rresht.tedhenat}</p>
            <p style={{ ...teksti, margin: 0, color: T.faint, fontSize: 13 }}>
              Pse: {rresht.pse}
            </p>
          </div>
        ))}
      </div>

      <div style={{ ...sx.panel, borderRadius: radii.lg, marginTop: 14 }}>
        <div style={{ color: T.ink, fontSize: 14.5, fontWeight: 800, marginBottom: 6 }}>
          Çfarë NUK mbledhim
        </div>
        <ul style={{ ...teksti, paddingLeft: 18, margin: 0 }}>
          {NUK_MBLEDHIM.map((rresht) => (
            <li key={rresht.slice(0, 24)} style={{ marginBottom: 6 }}>
              {rresht}
            </li>
          ))}
        </ul>
      </div>

      {SEKSIONET.slice(1).map((seksioni) => (
        <Seksioni key={seksioni.titulli} seksioni={seksioni} />
      ))}

      {/* Lidhja te faqja publike mbetet: dikush do të dojë ta ruajë ose ta
          dërgojë, dhe një pamje brenda aplikacionit nuk kopjohet dot. */}
      <a
        href={FAQJA}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          marginTop: 24,
          padding: 12,
          border: `1px solid ${T.line}`,
          borderRadius: radii.lg,
          color: T.sub,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <ExternalLink size={14} /> Hape te shfletuesi
      </a>
    </div>
  );
}
