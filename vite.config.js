import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,

    /**
     * `strictPort` është vendimtar.
     *
     * Pa të, kur porta 5173 është e zënë Vite kalon në heshtje te 5174, 5175…
     * Ti mbetesh me tab-in e vjetër te 5173 — të shërbyer nga një server i
     * mëparshëm që nuk ndjek më skedarët — dhe ndryshimet nuk shfaqen kurrë.
     *
     * Bashkë me të, `npm run dev` e liron vetë portën para se të nisë
     * (`scripts/free-port.mjs`). Të dyja së bashku japin garancinë që duhet:
     * GJITHMONË një server i vetëm, GJITHMONË te 5173, ndaj tab-i i hapur te
     * ajo adresë flet gjithmonë me serverin e tanishëm.
     *
     * `npm run dev:plain` e nis pa e liruar — kur do ta shohësh vetë gabimin.
     */
    strictPort: true,

    /**
     * `open` ishte `true`: çdo nisje e serverit hapte një tab TË RI.
     * Tani hape vetë http://localhost:5173 një herë — HMR-ja e përditëson
     * atë tab, pa hapur të tjerë.
     */
    open: false,

    /**
     * Përcjellja e `/api` te serveri i vërtetë.
     *
     * ⚠️  Kjo ndodh te Node-i i Vite-s, JO te shfletuesi — ndaj CORS-i nuk hyn
     *     fare në lojë. Pa të, `localhost:5173` do të bllokohej nga
     *     `APP_ORIGIN` te cPanel, që lejon vetëm `https://app.drartegogo.com`.
     *
     *     Alternativa do të ishte t'i shtoje `localhost` asaj liste — pra të
     *     zgjeroje konfigurimin e prodhimit për hir të zhvillimit. Kjo mënyrë
     *     e lë prodhimin të pandryshuar.
     *
     *     Baza mbetet relative edhe në ndërtim: aplikacioni shërbehet nga i
     *     njëjti host ku ndodhet API-ja, pra `/api` është e njëjta origjinë.
     */
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "https://app.drartegogo.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
