import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
	wait,
} from "../../../pw-utils.ts";
import { getFlameNodes } from "./utils.ts";

test("Should work with filtered HOC roots", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc-update");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("Wrapped")).waitFor();

	const nodes = await getFlameNodes(devtools);
	expect(nodes.find((x) => x.name === "Wrapped")?.hocs).toEqual(["withBoof"]);

	// Disabling HOC-filter should remove hoc labels
	await devtools.locator(locateTab("ELEMENTS")).click();
	await devtools.click('[data-testid="filter-menu-button"]');
	await devtools.waitForSelector('[data-testid="filter-popup"]');
	await devtools
		.locator('[data-testid="filter-popup"] label:has-text("HOC-Components")')
		.click();
	await devtools.click('[data-testid="filter-update"]');
	await wait(1000);

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("withBoof(Wrapped)")).waitFor();
});
