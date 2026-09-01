/**
 * ABONIMI — model freemium me provë falas.
 *
 * Logjikë e pastër: merr një regjistrim abonimi dhe një datë, kthen gjendjen.
 * Asnjë React, asnjë ruajtje — kështu rrjedha testohet pa hapur aplikacionin,
 * dhe zëvendësimi me Stripe prek vetëm shtresën që e thërret.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Sa ditë zgjat prova falas — seksioni 8: "3 ditë provë falas". */
export const TRIAL_DAYS = 3;

/**
 * Planet sipas seksionit 8.
 *
 * Vjetori: 59.99 / 12 ≈ 5€ në muaj, kundrejt 9.99 × 12 = 119.88 — pra gjysma.
 * `monthly` mbahet si numër dhe jo si tekst, që kursimi të llogaritet e të mos
 * shkruhet me dorë; një përqindje e shtypur ngec sapo ndryshon çmimi.
 */
export const PLANS = [
  { id: "month", label: "Mujor",  price: "9.99€",  periodDays: 30,  amount: 9.99,  monthly: 9.99 },
  { id: "year",  label: "Vjetor", price: "59.99€", periodDays: 365, amount: 59.99, monthly: 59.99 / 12, best: true },
];

/** Sa përqind kursen ky plan kundrejt atij mujor. */
export function savingsPercent(plan) {
  const monthly = PLANS.find((p) => p.id === "month").monthly;
  return Math.round((1 - plan.monthly / monthly) * 100);
}

/** Teksti nën çmimin e planit: "/muaj" ose "≈5€/muaj · kurse 50%". */
export function planNote(plan) {
  if (plan.id === "month") return "/muaj";
  return `≈${plan.monthly.toFixed(0)}€/muaj · kurse ${savingsPercent(plan)}%`;
}

export const planById = (id) => PLANS.find((p) => p.id === id) ?? PLANS[0];

/**
 * Tre hapat e timeline-it të provës (seksioni 8) — Sot → kujtesë → faturim.
 *
 * Etiketat rrjedhin nga `TRIAL_DAYS`, që të mos ngelen pas nëse kohëzgjatja e
 * provës ndryshon: një timeline i shkruar me dorë do të vazhdonte të thoshte
 * "Dita 3" edhe pasi prova të bëhej 7-ditore.
 */
export function trialTimeline() {
  return [
    {
      id: "start",
      day: "Sot",
      title: "Fillon prova falas",
      detail: "Zhbllokon gjithçka.",
    },
    {
      id: "remind",
      day: `Dita ${TRIAL_DAYS - 1}`,
      title: "Të kujtojmë",
      detail: "Njoftim që prova po mbaron.",
    },
    {
      id: "bill",
      day: `Dita ${TRIAL_DAYS}`,
      title: "Fillon abonimi",
      detail: "Tarifohesh vetëm nëse s'ke anuluar.",
    },
  ];
}

/**
 * Përkthen gjendjen e serverit në regjistrimin që njeh aplikacioni.
 *
 * ⚠️  Serveri mban `status`, `startedAt`, `endsAt`; aplikacioni mendon me
 *     `trialEndsAt` dhe llogarit vetë periudhat. Përkthimi bëhet vetëm këtu.
 *
 *     Për një provë, `endsAt` ËSHTË fundi i provës. Për një abonim të paguar,
 *     prova ka kaluar, ndaj `trialEndsAt` nxirret nga data e nisjes — kështu
 *     `describeSubscription` e klasifikon saktë si "aktiv" dhe jo si "provë".
 */
export function fromServer(state) {
  if (!state?.startedAt) return null;

  const startedAt = new Date(state.startedAt);
  const trialEndsAt =
    state.status === "trial" && state.endsAt
      ? new Date(state.endsAt)
      : new Date(startedAt.getTime() + TRIAL_DAYS * DAY_MS);

  return {
    planId: state.planId ?? "year",
    startedAt: startedAt.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    cancelled: Boolean(state.cancelled),
    cancelledAt: state.cancelledAt ? new Date(state.cancelledAt).toISOString() : null,
    /* Ora demo nuk vjen nga serveri — ajo është mjet i pajisjes. */
    offsetDays: 0,
    /* E vërteta e aksesit, ashtu siç e tha serveri. */
    serverIsPremium: Boolean(state.isPremium),
    serverStatus: state.status ?? null,
    trialUsed: Boolean(state.trialUsed),
    endsAt: state.endsAt ?? null,
  };
}

/** Krijon një abonim të ri, që nis me provën falas. */
export function startSubscription(planId, now = new Date()) {
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * DAY_MS);
  return {
    planId,
    startedAt: now.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    cancelled: false,
    /** Vetëm për demonstrim: sa ditë përpara "zhvendoset ora". */
    offsetDays: 0,
  };
}

/**
 * Fundi i periudhës së parë që mbaron PAS datës së dhënë.
 *
 * Për një abonim aktiv, thirret me datën e sotme → jep faturimin e radhës.
 * Për një abonim të anuluar, thirret me datën e ANULIMIT → jep fundin e
 * periudhës që ishte paguar atëherë. Ky dallim është thelbësor: po të
 * llogaritej nga data e sotme, një abonim i anuluar nuk do të skadonte kurrë.
 */
function periodEndAfter(subscription, date) {
  const period = planById(subscription.planId).periodDays * DAY_MS;
  let end = new Date(subscription.trialEndsAt).getTime();
  while (end <= date.getTime()) end += period;
  return new Date(end);
}

/** Data efektive, duke përfshirë zhvendosjen e demonstrimit. */
export const effectiveNow = (subscription, now = new Date()) =>
  new Date(now.getTime() + (subscription?.offsetDays ?? 0) * DAY_MS);

const daysBetween = (from, to) => Math.max(0, Math.ceil((to.getTime() - from.getTime()) / DAY_MS));

/**
 * Gjendja e plotë e abonimit.
 *
 * @returns {{
 *   status: "none"|"trial"|"active"|"cancelled"|"expired",
 *   isPremium: boolean, plan: object|null,
 *   daysLeft: number, accessUntil: Date|null, renewsAt: Date|null
 * }}
 */
export function describeSubscription(subscription, now = new Date()) {
  if (!subscription) {
    return { status: "none", isPremium: false, plan: null, daysLeft: 0, accessUntil: null, renewsAt: null };
  }

  const at = effectiveNow(subscription, now);
  const plan = planById(subscription.planId);
  const trialEnds = new Date(subscription.trialEndsAt);
  const inTrial = at < trialEnds;

  /* Anulimi nuk e pret aksesin menjëherë: vlen deri në fund të periudhës
     së paguar — ose deri në fund të provës, nëse ende s'ka nisur faturimi.
     Matet nga MOMENTI I ANULIMIT, jo nga sot. */
  if (subscription.cancelled) {
    const cancelledAt = new Date(subscription.cancelledAt ?? subscription.startedAt);
    const accessUntil =
      cancelledAt < trialEnds ? trialEnds : periodEndAfter(subscription, cancelledAt);
    const stillValid = at < accessUntil;
    return {
      status: stillValid ? "cancelled" : "expired",
      isPremium: stillValid,
      plan,
      daysLeft: stillValid ? daysBetween(at, accessUntil) : 0,
      accessUntil,
      renewsAt: null,
    };
  }

  const renewsAt = periodEndAfter(subscription, at);
  return {
    status: inTrial ? "trial" : "active",
    isPremium: true,
    plan,
    daysLeft: inTrial ? daysBetween(at, trialEnds) : daysBetween(at, renewsAt),
    accessUntil: null,
    renewsAt,
  };
}

/** Etiketat në shqip për çdo gjendje. */
export const STATUS_LABEL = {
  none: "Llogari Falas",
  trial: "Provë falas",
  active: "Premium aktiv",
  cancelled: "Anuluar",
  expired: "Skaduar",
};

const MONTHS_SQ = [
  "janar", "shkurt", "mars", "prill", "maj", "qershor",
  "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor",
];

/**
 * Data në shqip, e formatuar me dorë.
 *
 * `toLocaleDateString("sq-AL")` nuk është i besueshëm: shumë browser-a nuk
 * kanë të dhënat e gjuhës shqipe dhe bien te anglishtja pa paralajmërim.
 */
export const formatDate = (date) =>
  date ? `${date.getDate()} ${MONTHS_SQ[date.getMonth()]} ${date.getFullYear()}` : "";
