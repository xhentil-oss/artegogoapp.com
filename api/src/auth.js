const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { one, query } = require("./db");

/**
 * VËRTETIMI
 *
 * Zëvendëson Row Level Security-në që kishte versioni Postgres. Atje databaza
 * vetë ndalonte një përdorues të lexonte të dhënat e tjetrit; MySQL nuk e ka.
 * Prandaj çdo rrugë e mbrojtur kalon nga `requireAuth`, dhe çdo query mbi të
 * dhëna personale duhet të mbajë `WHERE user_id = ?`.
 *
 * ⚠️  `bcryptjs`, jo `bcrypt`: i dyti kërkon kompilim native, që në hosting të
 *     përbashkët zakonisht dështon. Ky është më i ngadaltë, por punon kudo.
 */

/** Sa raunde hash-imi. 10 është ekuilibri i zakonshëm siguri/shpejtësi. */
const ROUNDS = 10;

/** Sa gjatë vlen token-i. */
const TOKEN_TTL = process.env.JWT_TTL || "30d";

function secret() {
  const value = process.env.JWT_SECRET;
  /*
   * Dështo me zë nëse mungon.
   *
   * Një çelës i parazgjedhur do të thoshte që kushdo që lexon këtë kod mund
   * të nënshkruajë token-a për cilindo përdorues. Më mirë serveri të mos niset
   * fare sesa të niset i pambrojtur.
   */
  if (!value || value.length < 32) {
    throw new Error(
      "JWT_SECRET mungon ose është më i shkurtër se 32 shenja. " +
        "Vendose te cPanel → Setup Node.js App → Environment variables."
    );
  }
  return value;
}

const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash ?? "");

const signToken = (userId, sessionId) =>
  jwt.sign({ sub: userId, sid: sessionId }, secret(), { expiresIn: TOKEN_TTL });

/**
 * NJË LLOGARI — NJË PAJISJE.
 *
 * Çdo hyrje shkruan një `session_id` të ri te `users` dhe e fut brenda
 * token-it. `requireAuth` i krahason: token-i i pajisjes së mëparshme mban
 * një `sid` që nuk përputhet më, ndaj bie te kërkesa e parë.
 *
 * ⚠️  Fuqia e kësaj qëndron te databaza, jo te aplikacioni. Një kontroll te
 *     klienti do të anashkalohej duke mos e thënë fare; këtu token-i i vjetër
 *     thjesht nuk vlen më, kudo që të përdoret.
 *
 * ⚠️  Token-at e lëshuar PARA këtij ndryshimi nuk kanë `sid`, dhe llogaritë
 *     e vjetra e kanë `session_id` bosh. Atëherë kontrolli nuk zbatohet — pra
 *     askush nuk nxirret jashtë nga vetë vendosja; rregulli nis të vlerë nga
 *     hyrja e radhës.
 *
 * @returns {Promise<string>} token-i i ri
 */
async function startSession(userId) {
  const row = await one("SELECT UUID() AS id");
  const sessionId = row.id;
  await query("UPDATE users SET session_id = ? WHERE id = ?", [sessionId, userId]);
  return signToken(userId, sessionId);
}

/**
 * Kërkon një token të vlefshëm dhe vendos `req.userId`.
 *
 * Përdoruesi rilexohet nga databaza në çdo kërkesë, jo vetëm nga token-i:
 * një llogari e fshirë ose e pezulluar duhet të humbasë aksesin menjëherë,
 * jo pas 30 ditësh kur token-i skadon.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Mungon token-i i hyrjes." });

  try {
    const payload = jwt.verify(token, secret());
    const user = await one(
      `SELECT id, email, name, is_admin, is_premium, subscription_end_at, timezone, session_id
         FROM users WHERE id = ?`,
      [payload.sub]
    );
    if (!user) return res.status(401).json({ error: "Llogaria nuk ekziston më." });

    /*
     * Sesioni i zhvendosur te një pajisje tjetër.
     *
     * `code` shënohet veçëmas: aplikacioni duhet ta dallojë këtë nga një
     * token i skaduar, për të treguar arsyen e vërtetë në vend të një
     * "hyr sërish" pa shpjegim.
     */
    if (user.session_id && payload.sid !== user.session_id) {
      return res.status(401).json({
        error: "Llogaria u hap në një pajisje tjetër.",
        code: "session_replaced",
      });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token i pavlefshëm ose i skaduar." });
  }
}

/**
 * Vërteton NËSE ka token, por nuk e kërkon.
 *
 * Për rrugë publike që kthejnë diçka më shumë kur dihet kush pyet — feed-i,
 * ku postimi duhet të tregojë edhe a e ke pëlqyer dhe a e ke ruajtur TI.
 *
 * ⚠️  Asnjë gabim nuk del jashtë: një token i skaduar do të thotë "vizitor",
 *     jo "401". Përndryshe një sesion i vjetër te telefoni do ta linte feed-in
 *     bosh, ndërsa ai lexohet edhe pa hyrje fare.
 *
 * ⚠️  Edhe `secret()` rri brenda `try`-t: ai hedh kur `JWT_SECRET` mungon, dhe
 *     një konfigurim i paplotë nuk duhet ta rrëzojë leximin publik.
 */
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, secret());
    const user = await one(
      "SELECT id, email, name, is_admin, is_premium, subscription_end_at, timezone FROM users WHERE id = ?",
      [payload.sub]
    );
    if (user) {
      req.userId = user.id;
      req.user = user;
    }
  } catch {
    /* vizitor — vazhdohet pa identitet */
  }
  next();
}

/** Vetëm admin — për shkrimin e përmbajtjes. */
function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: "Vetëm administratorët." });
  next();
}

/**
 * A ka abonim të vlefshëm.
 *
 * Statusi i vetëm nuk mjafton: kontrollohet edhe data e mbarimit. Një abonim
 * i anuluar mbetet i vlefshëm deri në fund të periudhës së paguar — pikërisht
 * sjellja që kërkojnë App Store dhe Google Play.
 */
const hasPremium = (user) =>
  Boolean(user?.is_premium) &&
  Boolean(user?.subscription_end_at) &&
  new Date(user.subscription_end_at) > new Date();

/**
 * A lejohet të dëgjojë audio.
 *
 * Admini hyn kudo pa abonim: ai e ndërton dhe e kontrollon vetë përmbajtjen,
 * dhe do të ishte e pakuptimtë ta bllokonte paywall-i i tij.
 *
 * ⚠️  E ndarë nga `hasPremium` me qëllim. `hasPremium` i përgjigjet pyetjes
 *     "a ka abonim", dhe atë përgjigje e përdor `/me/subscription` për të
 *     treguar gjendjen te ekrani. Po ta shtonim admin-in atje, paneli i
 *     abonimit do t'i thoshte adminit se ka një abonim që nuk e ka blerë —
 *     dhe `/cancel` do të vepronte mbi asgjë.
 */
const canAccessAudio = (user) => Boolean(user?.is_admin) || hasPremium(user);

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  startSession,
  requireAuth,
  optionalAuth,
  requireAdmin,
  hasPremium,
  canAccessAudio,
};
