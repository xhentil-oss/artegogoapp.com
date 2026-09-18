import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Link2, Loader2, Radio, Trash2 } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { sx } from "../../../theme/styles.js";
import {
  createLiveSession,
  deleteLiveSession,
  fetchLiveSessions,
  setLiveOn,
  updateLiveSession,
} from "../../../services/adminApi.js";
import { Empty, Field, Panel, PrimaryButton, TextArea, TextInput } from "../AdminUI.jsx";

/**
 * SESIONET LIVE (seksioni 11) — kartelat me linkun e takimit.
 *
 * ⚠️  TANI SHKRUAN TE DATABAZA, JO TE `localStorage`.
 *
 *     Më parë sesionet ruheshin te `adminStore`, pra i shihte vetëm shfletuesi
 *     që i shkroi: admini "nisi" një transmetim dhe asnjë përdorues nuk merrte
 *     vesh asgjë, ndërsa butoni "Bashkohu tani" nuk çonte askund. Tani shkojnë
 *     te `live_sessions`, dhe linku u shfaqet të gjithëve sapo sesioni ndizet.
 *
 * ⚠️  Vetëm një sesion mund të jetë në ajër njëherësh; rregullin e zbaton
 *     serveri, jo ky ekran. Dy dhoma të hapura do të thoshin dy vende ku pritet
 *     i njëjti njeri.
 */
export function LiveTab() {
  const [sessions, setSessions] = useState([]);
  const [duke, setDuke] = useState(true);
  const [gabimi, setGabimi] = useState(null);

  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [when, setWhen] = useState("");
  const [emoji, setEmoji] = useState("🧘");
  const [joinUrl, setJoinUrl] = useState("");

  const lexo = useCallback(async () => {
    const result = await fetchLiveSessions();
    setDuke(false);
    if (result.ok) {
      setSessions(result.items);
      setGabimi(null);
    } else setGabimi(result.error);
  }, []);

  /*
   * ⚠️  Asnjë `setState` sinkron brenda efektit — gjendja vendoset vetëm PAS
   *     `await`-it. Një `setDuke(true)` këtu do të shkaktonte një render të
   *     dytë menjëherë pas montimit, pa asnjë të dhënë të re; prandaj `duke`
   *     nis i vërtetë dhe fiket kur përgjigjja mbërrin.
   */
  useEffect(() => {
    let cancelled = false;
    fetchLiveSessions().then((result) => {
      if (cancelled) return;
      setDuke(false);
      if (result.ok) setSessions(result.items);
      else setGabimi(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = title.trim().length > 0;

  const create = async () => {
    if (!ready) return;
    const result = await createLiveSession({
      emoji: emoji.trim() || "🧘",
      title: title.trim(),
      subtitle: sub.trim(),
      scheduleText: when.trim() || "Së shpejti",
      joinUrl: joinUrl.trim(),
    });
    if (!result.ok) return setGabimi(result.error);

    setTitle("");
    setSub("");
    setWhen("");
    setJoinUrl("");
    setGabimi(null);
    lexo();
  };

  const ruajLinkun = async (id, value) => {
    const result = await updateLiveSession(id, { joinUrl: value.trim() });
    if (!result.ok) return setGabimi(result.error);
    setGabimi(null);
    lexo();
  };

  const ndrysho = async (id, on) => {
    const result = await setLiveOn(id, on);
    if (!result.ok) return setGabimi(result.error);
    setGabimi(null);
    lexo();
  };

  const fshi = async (id) => {
    const result = await deleteLiveSession(id);
    if (!result.ok) return setGabimi(result.error);
    lexo();
  };

  return (
    <>
      <Panel
        title="Sesion i ri"
        note='Kartelat shfaqen te skeda "Komunitet" → Live. Linku u jepet përdoruesve vetëm kur sesioni është në ajër.'
      >
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 78 }}>
            <Field label="Emoji">
              <TextInput
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
                aria-label="Emoji i sesionit"
                style={{ textAlign: "center" }}
              />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Titulli">
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="p.sh. Meditim Live"
                aria-label="Titulli i sesionit"
              />
            </Field>
          </div>
        </div>

        <Field label="Përshkrimi">
          <TextArea
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            placeholder="Për çfarë do të jetë ky sesion…"
            aria-label="Përshkrimi i sesionit"
            style={{ minHeight: 62 }}
          />
        </Field>

        <Field label="Kur" hint="tekst i lirë">
          <TextInput
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="p.sh. E mërkurë · 19:00"
            aria-label="Kur zhvillohet"
          />
        </Field>

        <Field label="Linku i takimit" hint="Zoom, Meet — nis me https://">
          <TextInput
            value={joinUrl}
            onChange={(e) => setJoinUrl(e.target.value)}
            placeholder="https://us02web.zoom.us/j/…"
            aria-label="Linku i takimit"
            inputMode="url"
          />
        </Field>

        <PrimaryButton onClick={create} disabled={!ready} style={{ width: "100%" }}>
          <Radio size={15} /> Planifiko
        </PrimaryButton>
      </Panel>

      {gabimi && (
        <div
          style={{
            background: "#FDECEF",
            border: `1px solid ${T.live}`,
            borderRadius: radii.md,
            padding: "10px 12px",
            marginBottom: 14,
            color: T.ink,
            fontSize: 12.5,
          }}
        >
          {gabimi}
        </div>
      )}

      <Panel title="Sesionet" note={duke ? "Duke lexuar…" : `${sessions.length} gjithsej`}>
        {duke && sessions.length === 0 && (
          <div style={{ ...sx.center, padding: 20 }}>
            <Loader2 size={18} color={T.faint} className="ag-spin" />
          </div>
        )}

        {!duke && sessions.length === 0 && <Empty>Ende asnjë sesion i planifikuar.</Empty>}

        {sessions.map((session) => (
          <SessionRow
            /* Linku te çelësi: kur serveri kthen një adresë të re, rreshti
               rimontohet dhe fusha nis nga ajo. Shkrimi te fusha nuk e prek
               çelësin, ndaj shtypja e tastierës nuk e rimonton. */
            key={`${session.id}:${session.join_url ?? ""}`}
            session={session}
            onToggle={(on) => ndrysho(session.id, on)}
            onSaveUrl={(value) => ruajLinkun(session.id, value)}
            onDelete={() => fshi(session.id)}
          />
        ))}
      </Panel>
    </>
  );
}

/**
 * Një rresht i listës: gjendja, linku dhe dy veprimet.
 *
 * Linku redaktohet KËTU, jo te një ekran më vete: ai ndryshon para çdo takimi
 * (Zoom-i jep një adresë të re për çdo dhomë të planifikuar), dhe një formë e
 * veçantë do të kërkonte tre klikime për punën e një fushe.
 */
function SessionRow({ session, onToggle, onSaveUrl, onDelete }) {
  /*
   * Fusha nis nga vlera e serverit dhe pastaj i përket përdoruesit.
   *
   * ⚠️  Sinkronizimi me serverin bëhet me `key` te prindi (id + linku), jo me
   *     një efekt që thërret `setUrl`. Efekti do të shkaktonte një render të
   *     dytë sa herë rilexohet lista, dhe do të rrezikonte të fshinte atë që
   *     admini sapo shkroi nëse përgjigjja mbërrinte me vonesë.
   */
  const [url, setUrl] = useState(session.join_url ?? "");
  const [ruajtur, setRuajtur] = useState(false);
  /*
   * Fshirja në dy hapa.
   *
   * ⚠️  Më parë koshi fshinte me një klikim të vetëm, pa pyetur — dhe ndodhi
   *     pikërisht ajo që duhej pritur: një sesion u zhduk padashur, bashkë me
   *     linkun e tij. Rreshti është i ngushtë, koshi rri ngjitur me "Nis", dhe
   *     gishti nuk e ka luksin e miut.
   *
   *     Zgjedhja është pyetje INLINE, jo `window.confirm`: dialogu i sistemit e
   *     nxjerr adminin nga faqja dhe te telefoni shfaqet si njoftim i huaj.
   *     Pyetja rri aty ku është veprimi, dhe tërhiqet vetë pas pak sekondash —
   *     pra një prekje e rastësishme nuk e lë butonin të ngarkuar.
   */
  const [pyet, setPyet] = useState(false);

  const kerkoFshirjen = () => {
    if (!pyet) {
      setPyet(true);
      setTimeout(() => setPyet(false), 4000);
      return;
    }
    onDelete();
  };

  const ndryshuar = (session.join_url ?? "") !== url.trim();

  const ruaj = async () => {
    await onSaveUrl(url);
    setRuajtur(true);
    setTimeout(() => setRuajtur(false), 1600);
  };

  return (
    <div style={{ padding: "12px 0", borderTop: `1px solid ${T.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ fontSize: 22 }}>{session.emoji}</span>

        <div style={sx.flexText}>
          <div style={{ color: T.ink, fontSize: 13.5, fontWeight: 700, ...sx.truncate }}>
            {session.title}
          </div>
          <div style={{ color: T.faint, fontSize: 11.5, marginTop: 2 }}>{session.schedule_text}</div>
        </div>

        <button
          onClick={() => onToggle(!session.is_live)}
          role="switch"
          aria-checked={Boolean(session.is_live)}
          aria-label={`Në ajër — ${session.title}`}
          className="ag-press"
          style={{
            background: session.is_live ? T.live : T.bg,
            color: session.is_live ? "#fff" : T.sub,
            border: `1px solid ${session.is_live ? T.live : T.line}`,
            borderRadius: radii.pill,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {session.is_live ? "NË AJËR" : "Nis"}
        </button>

        <button
          onClick={kerkoFshirjen}
          aria-label={pyet ? `Konfirmo fshirjen — ${session.title}` : `Fshi ${session.title}`}
          className="ag-press"
          style={{
            background: pyet ? T.live : "none",
            color: "#fff",
            border: "none",
            borderRadius: radii.pill,
            padding: pyet ? "6px 11px" : 6,
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 800,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Trash2 size={15} color={pyet ? "#fff" : T.faint} />
          {pyet && "Fshije"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <Link2 size={15} color={T.faint} style={{ flexShrink: 0 }} />
        <TextInput
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://us02web.zoom.us/j/…"
          aria-label={`Linku i takimit — ${session.title}`}
          inputMode="url"
          style={{ flex: 1, fontSize: 12.5, padding: "8px 10px" }}
        />
        <button
          onClick={ruaj}
          disabled={!ndryshuar}
          className="ag-press"
          style={{
            background: ndryshuar ? T.ink : T.bg2,
            color: ndryshuar ? "#fff" : T.faint,
            border: "none",
            borderRadius: radii.md,
            padding: "8px 12px",
            cursor: ndryshuar ? "pointer" : "default",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {ruajtur ? "U ruajt" : "Ruaj"}
        </button>
      </div>

      {/* Prova e vetme që vlen: hape vetë linkun para se ta nisësh. */}
      {session.join_url && (
        <a
          href={session.join_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            marginTop: 8,
            color: T.sub,
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          <ExternalLink size={12} /> Provo linkun
        </a>
      )}

      {!session.join_url && (
        <div style={{ color: T.faint, fontSize: 11.5, marginTop: 8 }}>
          Pa link, sesioni nuk niset dot — serveri e refuzon.
        </div>
      )}
    </div>
  );
}
