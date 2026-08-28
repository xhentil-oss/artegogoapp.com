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
];
