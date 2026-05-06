import { test, expect } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateFlame,
} from "../../../pw-utils";

test("Should highlight flamegraph node if present in DOM", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-highlight");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").click();
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("Counter")).first().hover();

	await expect
		.poll(async () => {
			const log = (await page.evaluate(() => (window as any).log)) as any[];
			return log.filter(x => x.type === "highlight").length;
		})
		.toEqual(1);
});
