import { test, expect } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
} from "../pw-utils";

test("Debug mode toggles debug views", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	// Enable Capturing
	await devtools.locator(locateTab("SETTINGS")).click();
	const checked = await devtools
		.locator('[data-testid="toggle-debug-mode"]')
		.isChecked();
	expect(checked).toEqual(false);

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");
	await page.click("button");
	await clickRecordButton(devtools);
	await devtools.locator(locateFlame("Counter")).click();

	await expect(
		devtools.locator('[data-testid="profiler-debug-stats"]'),
	).toHaveCount(0);
	await expect(
		devtools.locator('[data-testid="profiler-debug-nav"]'),
	).toHaveCount(0);

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testid="toggle-debug-mode"]');

	await devtools.locator(locateTab("PROFILER")).click();

	await devtools.waitForSelector('[data-testid="profiler-debug-stats"]');
	await devtools.waitForSelector('[data-testid="profiler-debug-nav"]');
});
