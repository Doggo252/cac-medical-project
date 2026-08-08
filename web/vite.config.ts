import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Screener and rule types come from the same source of truth the
      // functions use. Types only — the client never evaluates a rule.
      "@shared": fileURLToPath(new URL("../shared/src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // The rules engine lives behind the Functions emulator; nothing about
    // eligibility is computed in this app.
    strictPort: false,
  },
});
