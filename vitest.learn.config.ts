import { defineConfig } from "vitest/config";

// Config for the /learn exercises only. Kept separate so `npm test` (the
// real suite, which must stay green) never runs half-finished exercises.
export default defineConfig({
  test: {
    include: ["learn/**/*.test.ts"],
    environment: "node",
  },
});
