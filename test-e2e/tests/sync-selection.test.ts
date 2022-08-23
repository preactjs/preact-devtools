import { test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
	locateTreeItem,
} from "../pw-utils";

test("Sync selection from profiler", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.click(locateTreeItem("Counter"));
	await devtools.click(locateTab("PROFILER"));

	await clickRecordButton(devtools);
	await page.click("button");
	await clickRecordButton(devtools);

	await devtools.waitForSelector('[data-type="flamegraph"]');
	await devtools.click(locateFlame("Display"));

	await devtools.click(locateTab("ELEMENTS"));
	await devtools.locator('[data-selected]:has-text("Display")').waitFor();
});
