import { test, expect } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateFlame,
	wait,
} from "../../../pw-utils";

test("Static subtree should be smaller in size", async ({ page }) => {
	const { devtools } = await gotoTest(page, "static-subtree");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");
	await page.click("button");
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("App")).waitFor();
	await devtools.locator('[data-testid="next-commit"]').click();
	await devtools
		.locator('[data-testid="commit-page-info"]:has-text("2 / 2")')
		.waitFor();

	// Wait for layouting
	await wait(500);

	const res = await devtools.evaluate(() => {
		const display = document.querySelector('[data-name="Display"]')!
			.clientWidth;
		const statics = Array.from(
			document.querySelectorAll('[data-name="Static"]')!,
		).map(el => el.clientWidth);

		return statics.every(w => w < display);
	});

	// Static nodes were bigger than Display
	expect(res).toEqual(true);
});
