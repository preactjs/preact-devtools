import { PlaywrightTestConfig } from "@playwright/test";
import path from "path";

const config: PlaywrightTestConfig = {
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	testDir: path.join(__dirname, "test-e2e", "tests"),
	// testMatch: "**/*.test.ts",
	use: {
		trace: "on-first-retry",
		viewport: { width: 1280, height: 720 },
	},
};

export default config;
