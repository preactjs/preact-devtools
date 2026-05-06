import { test, expect } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateFlame,
} from "../../../pw-utils";

test("Static subtree should be smaller in size", async ({ page }) => {
	const { devtools } = await gotoTest(page, "static-subtree");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").click();
	await page.locator("button").click();
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("App")).waitFor();
	await devtools.locator('[data-testid="next-commit"]').click();
	await devtools
		.locator('[data-testid="commit-page-info"]:has-text("2 / 2")')
		.waitFor();

	// Static nodes should be smaller than Display
	await expect
		.poll(() =>
			devtools.evaluate(() => {
				const display = document.querySelector(
					'[data-name="Display"]',
				)!.clientWidth;
				const statics = Array.from(
					document.querySelectorAll('[data-name="Static"]')!,
				).map(el => el.clientWidth);
				return statics.every(w => w > 0 && w < display);
			}),
		)
		.toBe(true);
});
