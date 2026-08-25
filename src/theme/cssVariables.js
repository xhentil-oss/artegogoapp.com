import { T, layout } from "./tokens.js";

/**
 * Kopjon token-et JS në CSS custom properties mbi <html>.
 *
 * Kështu `animations.css` dhe `global.css` referojnë të njëjtat vlera
 * (`var(--ag-bg2)`, `var(--ag-frame)`) pa i dublikuar. Thirre një herë
 * në nisje të aplikacionit.
 */
export function injectCssVariables(root = document.documentElement) {
  Object.entries(T).forEach(([name, value]) => {
    root.style.setProperty(`--ag-${kebab(name)}`, value);
  });

  /* gjerësia e kornizës — e nevojshme edhe në CSS për fletët `fixed` */
  root.style.setProperty("--ag-frame", `${layout.frameWidth}px`);
}

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
