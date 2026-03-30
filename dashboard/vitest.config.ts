import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@tmux-ide/ws-v3-protocol": path.resolve(__dirname, "../src/lib/ws-v3/protocol.ts"),
    },
  },
});
