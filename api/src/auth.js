const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { one } = require("./db");

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

const signToken = (userId) => jwt.sign({ sub: userId }, secret(), { expiresIn: TOKEN_TTL });

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
      "SELECT id, email, name, is_admin, is_premium, subscription_end_at, timezone FROM users WHERE id = ?",
      [payload.sub]
    );
    if (!user) return res.status(401).json({ error: "Llogaria nuk ekziston më." });

    req.userId = user.id;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token i pavlefshëm ose i skaduar." });
  }
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

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  requireAdmin,
  hasPremium,
};
