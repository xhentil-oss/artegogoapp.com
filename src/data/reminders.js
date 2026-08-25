/**
 * KUJTESAT — tre çastet e ditës që caktohen gjatë onboarding-ut.
 *
 * Specifikimi ruan vetëm emrin dhe oraret; hapat për qëllime apo kohëzgjatje
 * u hoqën me qëllim, për ta mbajtur regjistrimin të shkurtër.
 */
export const REMINDER_SLOTS = [
  { id: "morning", label: "Mëngjes", defaultTime: "07:30", intent: "energy" },
  { id: "noon",    label: "Drekë",   defaultTime: "13:00", intent: "focus" },
  { id: "evening", label: "Darkë",   defaultTime: "21:00", intent: "sleep" },
];

/** Gjendja fillestare: të treja të fikura, siç i lë përdoruesi nëse s'i prek. */
export const defaultReminders = () =>
  Object.fromEntries(
    REMINDER_SLOTS.map((slot) => [slot.id, { enabled: false, time: slot.defaultTime }])
  );
