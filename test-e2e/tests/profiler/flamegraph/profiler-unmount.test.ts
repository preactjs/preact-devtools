import { test } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateFlame,
	locateProfilerTab,
} from "../../../pw-utils";

test("Should highlight flamegraph node if present in DOM", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-highlight");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").first().click();
	await clickRecordButton(devtools);

	await page.locator("button").first().click();
	await devtools.locator(locateProfilerTab("RANKED")).click();
	await devtools.locator('[data-type="ranked"]').waitFor();
	await devtools.locator(locateProfilerTab("FLAMEGRAPH")).click();

	await devtools.locator(locateFlame("Counter")).first().waitFor();
});
