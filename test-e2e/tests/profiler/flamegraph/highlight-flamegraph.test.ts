import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
	wait,
} from "../../../pw-utils.ts";

test("Should highlight flamegraph node if present in DOM", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-highlight");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("Counter")).first().hover();
	// Wait for possible flickering to occur
	await wait(1000);

	const log = (await page.evaluate(() => (window as any).log)) as any[];
	expect(log.filter((x) => x.type === "highlight").length).toEqual(1);
});
