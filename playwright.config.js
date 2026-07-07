import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://localhost:4321",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npx astro dev --port 4321",
    port: 4321,
    timeout: 30000,
    reuseExistingServer: true,
  },
});
