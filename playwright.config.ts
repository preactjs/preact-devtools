import type { PlaywrightTestConfig } from "@playwright/test";
import path from "path";

const config: PlaywrightTestConfig = {
	use: {
		viewport: { width: 1280, height: 768 },
		ignoreHTTPSErrors: true,
		video: "on-first-retry",
		trace: "retain-on-failure",
	},
	testDir: path.join(__dirname, "test-e2e", "tests"),
	testMatch: "**/*.test.ts",
	// retries: 3,
	timeout: 10 * 1000,
	webServer: {
		command: "npm run dev",
		url: "http://localhost:8100/",
		timeout: 120 * 1000,
		reuseExistingServer: true,
	},
};
export default config;
