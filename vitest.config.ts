import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 15000, // Turso HTTP calls can be slow
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
