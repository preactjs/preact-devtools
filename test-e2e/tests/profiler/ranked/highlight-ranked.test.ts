import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateProfilerTab,
	locateTab,
	wait,
} from "../../../pw-utils.ts";

test("Should highlight ranked node if present in DOM", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-highlight");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").first().click();
	await clickRecordButton(devtools);

	await devtools.locator(locateProfilerTab("RANKED")).click();
	await devtools.hover('[data-type="ranked"] [data-name="Counter"]');
	await wait(1000);

	const log = (await page.evaluate(() => (window as any).log)) as any[];
	expect(log.filter((x) => x.type === "highlight").length).toEqual(1);
});
