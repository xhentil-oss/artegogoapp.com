const express = require("express");
const { query, one } = require("../db");
const { requireAuth, requireAdmin } = require("../auth");

/**
 * ═══════════════════════════════════════════════════════════════
 *  SESIONET LIVE — kartelat e Zoom-it
 * ═══════════════════════════════════════════════════════════════
 *
 * Leximi është publik; shkrimi i takon vetëm admin-it.
 *
 * ⚠️  LINKU JEPET VETËM KUR SESIONI ËSHTË NË AJËR.
 *
 *     `join_url` ruhet gjithmonë, por rruga publike e kthen vetëm kur
 *     `is_live = 1`. Ndryshe, adresa e dhomës do të qarkullonte ditë përpara
 *     takimit — dhe një dhomë Zoom-i me link të njohur është dhomë e hapur për
 *     këdo. Kjo është arsyeja pse butoni "Nis" te paneli nuk është vetëm një
 *     pikë e kuqe: ai është çelësi që e hap derën.
 */

/** Kolonat që sheh publiku — pa `join_url`, i cili shtohet me kusht. */
const FIELDS_PUBLIC = `id, emoji, title, subtitle, schedule_text, is_live, display_order`;

/**
 * Një adresë e vlefshme takimi, ose `null`.
 *
 * ⚠️  Pranohet vetëm `http(s)`. Pa këtë kontroll, një adresë `javascript:…` e
 *     ruajtur nga paneli do të shndërrohej te aplikacioni në një link që
 *     ekzekuton kod te shfletuesi i çdo përdoruesi që e shtyp.
 *
 * Nuk kufizohet te `zoom.us`: e njëjta kartelë duhet të mbajë edhe Google Meet
 * ose çfarëdo platforme që zgjidhet nesër.
 */
function safeUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.toString().slice(0, 600);
  } catch {
    return false;
  }
}

/* ─────────────── publike ─────────────── */

const publik = express.Router();

/**
 * GET /content/live
 *
 * Kthen kartelat siç i sheh përdoruesi. `join_url` vjen vetëm për atë në ajër.
 */
publik.get("/live", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT ${FIELDS_PUBLIC},
              CASE WHEN is_live = 1 THEN join_url ELSE NULL END AS join_url
         FROM live_sessions
        ORDER BY is_live DESC, display_order, created_at`
    );
    res.json(rows);
  } catch (err) {
    /* Tabela mund të mos ekzistojë ende (migrimi `16_live.sql` i parrjedhur).
       Atëherë kthehet listë bosh dhe aplikacioni bie te kartelat e veta — një
       veçori e re nuk duhet ta rrëzojë ekranin që punonte. */
    if (err?.code === "ER_NO_SUCH_TABLE") {
      console.warn("[artegogo] `live_sessions` mungon — rrjedh `mysql/16_live.sql`.");
      return res.json([]);
    }
    next(err);
  }
});

/* ─────────────── admin ─────────────── */

const admin = express.Router();
admin.use(requireAuth, requireAdmin);

/** Të gjitha, ME linkun — paneli duhet ta shohë edhe kur sesioni është i fikur. */
admin.get("/live", async (_req, res, next) => {
  try {
    res.json(
      await query(
        `SELECT ${FIELDS_PUBLIC}, join_url, created_at
           FROM live_sessions ORDER BY display_order, created_at`
      )
    );
  } catch (err) {
    if (err?.code === "ER_NO_SUCH_TABLE") return res.json([]);
    next(err);
  }
});

admin.post("/live", async (req, res, next) => {
  const { emoji = "🧘", title, subtitle = null, scheduleText = null, joinUrl = null } = req.body ?? {};

  const emri = String(title ?? "").trim();
  if (!emri) return res.status(400).json({ error: "Titulli nuk mund të jetë bosh." });

  const link = safeUrl(joinUrl);
  if (link === false) return res.status(400).json({ error: "Linku duhet të nisë me http:// ose https://" });

  try {
    const { id } = await one("SELECT UUID() AS id");
    const { n } = (await one("SELECT COALESCE(MAX(display_order), 0) + 1 AS n FROM live_sessions")) ?? { n: 1 };

    await query(
      `INSERT INTO live_sessions (id, emoji, title, subtitle, schedule_text, join_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, String(emoji).slice(0, 8) || "🧘", emri.slice(0, 160),
       subtitle ? String(subtitle).slice(0, 400) : null,
       scheduleText ? String(scheduleText).slice(0, 160) : null, link, n]
    );

    res.status(201).json(await one(`SELECT ${FIELDS_PUBLIC}, join_url FROM live_sessions WHERE id = ?`, [id]));
  } catch (err) {
    next(err);
  }
});

/**
 * Ndryshon një sesion — vetëm fushat e dërguara.
 *
 * `COALESCE` mbi parametrin: ajo që nuk vjen, mbetet siç ishte. Pa këtë, një
 * panel që dërgon vetëm linkun do të fshinte titullin dhe orarin.
 */
admin.put("/live/:id", async (req, res, next) => {
  const { emoji, title, subtitle, scheduleText, joinUrl } = req.body ?? {};

  /* `joinUrl: ""` do të thotë "hiqe linkun" — dhe kjo duhet dalluar nga
     "mos e prek", ndaj trajtohet veç. */
  let link;
  if (joinUrl !== undefined) {
    link = safeUrl(joinUrl);
    if (link === false) return res.status(400).json({ error: "Linku duhet të nisë me http:// ose https://" });
  }

  try {
    const result = await query(
      `UPDATE live_sessions
          SET emoji         = COALESCE(?, emoji),
              title         = COALESCE(?, title),
              subtitle      = COALESCE(?, subtitle),
              schedule_text = COALESCE(?, schedule_text),
              join_url      = ${joinUrl === undefined ? "join_url" : "?"}
        WHERE id = ?`,
      [
        emoji ? String(emoji).slice(0, 8) : null,
        title ? String(title).trim().slice(0, 160) : null,
        subtitle !== undefined && subtitle !== null ? String(subtitle).slice(0, 400) : null,
        scheduleText !== undefined && scheduleText !== null ? String(scheduleText).slice(0, 160) : null,
        ...(joinUrl === undefined ? [] : [link]),
        req.params.id,
      ]
    );
    if ((result.affectedRows ?? 0) === 0) return res.status(404).json({ error: "Sesioni nuk u gjet." });

    res.json(await one(`SELECT ${FIELDS_PUBLIC}, join_url FROM live_sessions WHERE id = ?`, [req.params.id]));
  } catch (err) {
    next(err);
  }
});

/**
 * Ndez ose fik një sesion.
 *
 * ⚠️  Ndezja e njërit i fik TË GJITHË të tjerët, me një `UPDATE` të vetëm para
 *     tij. Dy pika të kuqe njëherësh do të thoshin dy dhoma të hapura, dhe
 *     përdoruesi nuk do ta dinte ku ta ndiqte takimin.
 *
 * ⚠️  Pa link nuk ndizet dot: një kartelë "NË AJËR" me butonin që nuk çon
 *     askund është pikërisht defekti që kjo veçori erdhi të ndreqë.
 */
admin.post("/live/:id/live", async (req, res, next) => {
  const on = Boolean(req.body?.on ?? true);

  try {
    const session = await one("SELECT id, join_url FROM live_sessions WHERE id = ?", [req.params.id]);
    if (!session) return res.status(404).json({ error: "Sesioni nuk u gjet." });

    if (on && !session.join_url) {
      return res.status(400).json({ error: "Vendos linkun e takimit para se ta nisësh." });
    }

    if (on) await query("UPDATE live_sessions SET is_live = 0 WHERE id <> ?", [req.params.id]);
    await query("UPDATE live_sessions SET is_live = ? WHERE id = ?", [on ? 1 : 0, req.params.id]);

    res.json(await one(`SELECT ${FIELDS_PUBLIC}, join_url FROM live_sessions WHERE id = ?`, [req.params.id]));
  } catch (err) {
    next(err);
  }
});

admin.delete("/live/:id", async (req, res, next) => {
  try {
    const result = await query("DELETE FROM live_sessions WHERE id = ?", [req.params.id]);
    if ((result.affectedRows ?? 0) === 0) return res.status(404).json({ error: "Sesioni nuk u gjet." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = { publicRoutes: publik, adminRoutes: admin };
