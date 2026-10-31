/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { notesPlugin } from "./plugins/notes";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const root = process.cwd();

  return {
    plugins: [
      react(),
      tailwindcss(),
      notesPlugin({
        notesDir: path.resolve(root, "src/content/notes"),
        draftsDir: path.resolve(root, "src/content/drafts"),
        siteOrigin: env.VITE_SITE_URL || undefined,
      }),
    ],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}", "plugins/**/*.test.ts"],
      css: false,
    },
  };
});
