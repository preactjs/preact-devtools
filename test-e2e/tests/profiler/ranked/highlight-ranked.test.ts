import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateProfilerTab,
} from "../../../pw-utils";

test("Should highlight ranked node if present in DOM", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-highlight");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").first().click();
	await clickRecordButton(devtools);

	await devtools.locator(locateProfilerTab("RANKED")).click();
	await devtools
		.locator('[data-type="ranked"] [data-name="Counter"]')
		.first()
		.hover();

	await expect
		.poll(async () => {
			const log = (await page.evaluate(() => (window as any).log)) as any[];
			return log.filter(x => x.type === "highlight").length;
		})
		.toEqual(1);
});
