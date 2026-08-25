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
     * Me `strictPort`, serveri ndalon me gabim të qartë: "Port 5173 is in use".
     */
    strictPort: true,

    /**
     * `open` ishte `true`: çdo nisje e serverit hapte një tab TË RI.
     * Tani hape vetë http://localhost:5173 një herë — HMR-ja e përditëson
     * atë tab, pa hapur të tjerë.
     */
    open: false,
  },
});
