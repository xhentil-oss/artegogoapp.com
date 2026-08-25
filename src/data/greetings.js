import { DAY_PARTS } from "../lib/time.js";

/**
 * Përshëndetjet, etiketat dhe citatet sipas pjesës së ditës.
 * Faqja "Sot" zgjedh bllokun sipas `dayPart()`.
 */
export const GREETINGS = {
  [DAY_PARTS.MORNING]: {
    hi: "Mirëmëngjes",
    label: "RITUALI I MËNGJESIT",
    sub: "Nis ditën me qartësi dhe qëllim",
    intent: "energy",
    quotes: [
      "Çdo mëngjes je një version i ri i vetes.",
      "Fryma e parë e ditës është një dhuratë.",
      "Si e nis mëngjesin, ashtu e formon ditën.",
    ],
  },
  [DAY_PARTS.AFTERNOON]: {
    hi: "Mirëdita",
    label: "PAUZË KOHERENCE",
    sub: "Një moment qetësie në mes të ditës",
    intent: "focus",
    quotes: [
      "Ndalo. Merr frymë. Rikthehu te qendra.",
      "Qetësia mes zhurmës është fuqi.",
      "Një pauzë e vetëdijshme rikthen energjinë.",
    ],
  },
  [DAY_PARTS.EVENING]: {
    hi: "Mirëmbrëma",
    label: "ÇLODHJE E MBRËMJES",
    sub: "Lëre ditën dhe kthehu te vetja",
    intent: "calm",
    quotes: [
      "Lëre ditën të shkojë butësisht.",
      "Mbrëmja është koha për të çliruar.",
      "Mirënjohja e mbyll ditën me paqe.",
    ],
  },
  [DAY_PARTS.NIGHT]: {
    hi: "Natën e mirë",
    label: "SHTEGU I GJUMIT",
    sub: "Përgatitu për pushim të thellë",
    intent: "sleep",
    quotes: [
      "Gjumi është meditimi më i thellë.",
      "Lëre trupin të prehet, mendjen të qetësohet.",
      "Nata sjell rilindjen e mëngjesit.",
    ],
  },
};

/** Hapat e ritmit ditor — shkyçen sipas orës. */
export const DAILY_RHYTHM_STEPS = [
  { id: "morning", title: "Cakto qëllimin",          sub: "Nis ditën me qartësi",              icon: "sunrise", fromHour: 5,  intent: "energy" },
  { id: "midday",  title: "Rivendosja e mesditës",   sub: "Kontrollo gjendjen & merr frymë",   icon: "sun",     fromHour: 12, intent: "calm" },
  { id: "evening", title: "Reflekto & çliro",        sub: "Mbylle ditën me qetësi",            icon: "moon",    fromHour: 19, intent: "sleep" },
];
