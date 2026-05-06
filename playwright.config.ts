import type { PlaywrightTestConfig } from "@playwright/test";
import path from "path";

const config: PlaywrightTestConfig = {
	use: {
		viewport: { width: 1280, height: 768 },
		ignoreHTTPSErrors: true,
		video: "on-first-retry",
		trace: "retain-on-failure",
		actionTimeout: 10 * 1000,
		navigationTimeout: 20 * 1000,
	},
	expect: {
		timeout: 5 * 1000,
	},
	testDir: path.join(__dirname, "test-e2e", "tests"),
	testMatch: "**/*.test.ts",
	forbidOnly: !!process.env.CI,
	// retries: 3,
	timeout: 20 * 1000,
	workers: process.env.CI ? 2 : undefined,
	webServer: {
		command: "npm run dev",
		url: "http://localhost:8100/",
		timeout: 120 * 1000,
		reuseExistingServer: !process.env.CI,
	},
};
export default config;
