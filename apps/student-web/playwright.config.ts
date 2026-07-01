import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev -- --port 5174",
    reuseExistingServer: true,
    url: "http://127.0.0.1:5174",
  },
  use: {
    baseURL: "http://127.0.0.1:5174",
    channel: "msedge",
  },
});
