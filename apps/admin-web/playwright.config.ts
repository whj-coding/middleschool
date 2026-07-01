import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: [
    {
      command: "powershell -NoProfile -Command \"Set-Location ..\\..\\services\\api; npm run dev\"",
      url: "http://127.0.0.1:4000/health",
      reuseExistingServer: true,
    },
    {
      command: "npm run dev -- --port 5175",
      url: "http://127.0.0.1:5175",
      reuseExistingServer: true,
    },
  ],
  use: { baseURL: "http://127.0.0.1:5175", channel: "msedge" },
});
