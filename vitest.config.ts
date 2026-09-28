import { defineConfig } from "vitest/config";
import path from "node:path";

// فقط برای تست توابع خالص (lib/*) — نیازی به jsdom/React نیست، پس محیط
// پیش‌فرض «node» کافیه. alias همون «@/» توی tsconfig.json رو تکرار می‌کنه.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
