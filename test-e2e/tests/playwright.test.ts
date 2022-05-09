import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
	await page.goto("https://playwright.dev/");
	const title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");
});

test("basic test #2", async ({ page }) => {
	const name = "update-all";
	const preactVersion = "10.7.2";
	const BASE_URL = `http://localhost:8100/?fixtures=${name}&preact=${preactVersion}`;
	await page.goto(BASE_URL);

	const devtools = await page
		.mainFrame()
		.childFrames()
		.find(f => f.url().includes("devtools.html"));

	await devtools.locator('[data-testid="tree-item"]').waitFor();

	// Nothing should be collapsed initially
	const count = await devtools
		.locator('[data-testid="tree-item"] [data-collapsed="true"]')
		.count();
	expect(count).toEqual(0);

	await page.pause();
	const title = page.locator(".navbar__inner .navbar__title");
	await expect(title).toHaveText("Playwright");
});
