import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { sx } from "../../../theme/styles.js";
import { listFeed, listMeditations, listPostTypes } from "../../../services/contentRepository.js";
import { createPost, deletePost } from "../../../services/adminStore.js";
import { nextId } from "../../../lib/id.js";
import { Empty, Field, Panel, PrimaryButton, Select, TextArea, TextInput } from "../AdminUI.jsx";

/**
 * POSTIM NË KOMUNITET (seksioni 11) — "me meditim të bashkangjitur".
 *
 * Meditimi ruhet si ID, ndaj postimi mund ta hapë atë drejtpërdrejt te feed-i.
 * Postimet e reja shfaqen në krye, para atyre bazë.
 */
export function CommunityTab() {
  const meditations = listMeditations();

  const [author, setAuthor] = useState("Artemisa");
  const [type, setType] = useState(listPostTypes()[0] ?? "Frymëzim");
  const [text, setText] = useState("");
  const [meditationId, setMeditationId] = useState("");
  /*
   * PAMJA E POSTIMIT — zgjedhje, jo rregull.
   *
   * ⚠️  Më parë çdo postim dilte me një drejtkëndësh gradienti të vizatuar nga
   *     kodi; nuk kishte mënyrë as ta hiqje, as të vendosje foton tënde. Tani
   *     ruhet `images`: bosh = vetëm tekst, një adresë = një foto, disa = karusel.
   */
  const [pamja, setPamja] = useState("asnje");
  const [imazhe, setImazhe] = useState("");

  /* Një adresë për rresht; rreshtat bosh dhe hapësirat bien vetë. */
  const listaImazheve =
    pamja === "asnje"
      ? []
      : imazhe
          .split(String.fromCharCode(10))
          .map((rresht) => rresht.trim())
          .filter(Boolean)
          .slice(0, pamja === "nje" ? 1 : undefined);

  const ready = text.trim().length > 0;
  /*
   * Lista vjen nga FEED-I I VËRTETË, jo nga `admin.posts`.
   *
   * ⚠️  `admin.posts` mban vetëm postimet në pritje — ato që sapo u dërguan dhe
   *     për të cilat serveri nuk ka përgjigjur ende. Pas botimit ai zbrazet,
   *     ndaj lista do të dukej bosh ndërsa feed-i i publikut ishte plot.
   */
  const posts = listFeed();

  /**
   * Boton postimin TE DATABAZA.
   *
   * ⚠️  Fusha `time` nuk ruhet më si "Tani": ajo llogaritet në lexim nga
   *     `published_at`. Një etiketë e ruajtur do të mbetej "Tani" edhe pas një
   *     jave — dhe pikërisht ashtu ishte më parë.
   */
  const publish = async () => {
    if (!ready) return;
    const attached = meditations.find((m) => m.id === meditationId);

    const result = await createPost({
      /* e njëjta formë si te `data/feed.js`, që lista lokale e pritjes të
         vizatohet me të njëjtin komponent */
      id: nextId("post"),
      author: author.trim() || "Arte Gogo",
      handle: "Arte Gogo",
      time: "Tani",
      intent: attached?.intent ?? "heart",
      type,
      verified: true,
      likes: 0,
      comments: 0,
      text: text.trim(),
      meditationId: attached?.id ?? null,
      images: listaImazheve,
    });

    /* Fushat pastrohen vetëm pas suksesit: nëse botimi dështon, teksti i
       shkruar nuk duhet të humbet. */
    if (result.ok) {
      setText("");
      setMeditationId("");
      setImazhe("");
      setPamja("asnje");
    }
  };

  return (
    <>
      <Panel
        title="Postim i ri"
        note={`${posts.length} postime. Shfaqen menjëherë te skeda "Komunitet", për të gjithë.`}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Field label="Autori">
              <TextInput
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                aria-label="Autori i postimit"
              />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Lloji">
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={listPostTypes().map((t) => ({ id: t, label: t }))}
                aria-label="Lloji i postimit"
              />
            </Field>
          </div>
        </div>

        <Field label="Teksti">
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Çfarë do të ndash sot…"
            aria-label="Teksti i postimit"
          />
        </Field>

        <Field label="Pamja" hint="opsionale">
          <Select
            value={pamja}
            onChange={(e) => setPamja(e.target.value)}
            options={[
              { id: "asnje", label: "Pa imazh — vetëm tekst" },
              { id: "nje", label: "Një imazh" },
              { id: "karusel", label: "Karusel (disa imazhe)" },
            ]}
            aria-label="Pamja e postimit"
          />
        </Field>

        {pamja === "nje" && (
          <Field label="Adresa e imazhit" hint="p.sh. /kopertina/emri.jpeg">
            <TextInput
              value={imazhe}
              onChange={(e) => setImazhe(e.target.value)}
              placeholder="/kopertina/emri.jpeg"
              aria-label="Adresa e imazhit"
            />
          </Field>
        )}

        {pamja === "karusel" && (
          <Field label="Adresat e imazheve" hint="një për rresht, sipas radhës">
            <TextArea
              value={imazhe}
              onChange={(e) => setImazhe(e.target.value)}
              placeholder={"/kopertina/e-para.jpeg" + String.fromCharCode(10) + "/kopertina/e-dyta.jpeg"}
              aria-label="Adresat e imazheve"
            />
          </Field>
        )}

        <Field label="Meditim i bashkangjitur" hint="opsional">
          <Select
            value={meditationId}
            onChange={(e) => setMeditationId(e.target.value)}
            options={meditations.map((m) => ({ id: m.id, label: `${m.title} (${m.subTheme})` }))}
            placeholder="Pa meditim"
            aria-label="Meditimi i bashkangjitur"
          />
        </Field>

        <PrimaryButton onClick={publish} disabled={!ready} style={{ width: "100%" }}>
          <Send size={15} /> Publiko
        </PrimaryButton>
      </Panel>

      <Panel title="Postimet">
        {posts.length === 0 && <Empty>Ende asnjë postim.</Empty>}

        {posts.map((post) => {
          const attached = meditations.find((m) => m.id === post.meditationId);
          return (
            <div
              key={post.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "11px 0",
                borderTop: `1px solid ${T.line}`,
              }}
            >
              <div style={sx.flexText}>
                <div style={{ color: T.faint, fontSize: 11, marginBottom: 3 }}>
                  {post.author} · {post.type}
                </div>
                <div style={{ color: T.ink, fontSize: 13, lineHeight: 1.5 }}>
                  {post.text.slice(0, 90)}
                  {post.text.length > 90 ? "…" : ""}
                </div>
                {attached && (
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: 6,
                      background: "rgba(124,92,224,0.12)",
                      color: T.accent,
                      borderRadius: radii.pill,
                      padding: "3px 9px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    ♪ {attached.title}
                  </div>
                )}
              </div>

              <button
                onClick={() => deletePost(post.id)}
                aria-label={`Fshi postimin e ${post.author}`}
                className="ag-press"
                style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}
              >
                <Trash2 size={15} color={T.faint} />
              </button>
            </div>
          );
        })}
      </Panel>
    </>
  );
}
