import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Rregullat që mbajnë kodin të pastër ndërsa projekti rritet.
 * Ekzekuto: `npm run lint`
 */
export default [
  { ignores: ["dist/**", "node_modules/**"] },

  js.configs.recommended,

  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      /* React 17+ nuk kërkon import të React në fajlla JSX */
      "react/react-in-jsx-scope": "off",
      /* projekti është JS i thjeshtë; tipizimi bëhet me JSDoc */
      "react/prop-types": "off",

      /* higjiena që duam të mbahet */
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      eqeqeq: ["warn", "smart"],
    },
  },

  /*
   * Mjetet e zhvillimit rrjedhin në Node, jo në shfletues.
   *
   * Pa këtë bllok, `npm run lint` i shënonte `process` dhe `console` si të
   * papërcaktuara te `scripts/` — 14 gabime për kod krejtësisht të saktë.
   * Aty `console.log` është vetë qëllimi, ndaj rregulli hiqet.
   */
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "off",
    },
  },

  /*
   * Service Worker-i rrjedh te një kontekst i vetin.
   *
   * `self`, `clients` dhe `registration` nuk ekzistojnë te faqja — pa këtë
   * bllok, `npm run lint` i shënon si të papërcaktuara te kod krejtësisht i
   * saktë, dhe ai skedar është pikërisht ai që nuk duhet të ketë gabime: ai
   * rrjedh kur aplikacioni është i mbyllur, ku askush nuk i sheh.
   */
  {
    files: ["public/sw.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: { ...globals.serviceworker },
    },
  },

  /*
   * API-ja është Node dhe CommonJS.
   *
   * `sourceType: "commonjs"` është pjesa thelbësore: pa të, `require` dhe
   * `module` dalin "të papërcaktuara" te çdo skedar i `api/` — 52 gabime për
   * kod që rrjedh saktë te serveri. CommonJS-i aty është zgjedhje e
   * qëllimshme, jo mbetje: Passenger-i i cPanel-it e mbështet pa konfigurim
   * shtesë, ndërsa `type: module` kërkon rregullime sipas hostit.
   *
   * `console` mbetet i lejuar: te serveri log-u është i vetmi mjet
   * diagnostikimi, dhe `stderr.log` ishte pikërisht ai që zbuloi hapësirat te
   * variablat e mjedisit gjatë vendosjes.
   */
  {
    files: ["api/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "off",
    },
  },
];
