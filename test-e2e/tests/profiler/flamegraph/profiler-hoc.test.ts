import { test, expect } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateFlame,
} from "../../../pw-utils";
import { getFlameNodes } from "./utils";

test("Should work with filtered HOC roots", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc-update");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").click();
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("Wrapped")).waitFor();

	await expect
		.poll(async () => {
			const nodes = await getFlameNodes(devtools);
			return nodes.find(x => x.name === "Wrapped")?.hocs;
		})
		.toEqual(["withBoof"]);

	// Disabling HOC-filter should remove hoc labels
	await devtools.locator(locateTab("ELEMENTS")).click();
	await devtools.locator('[data-testid="filter-menu-button"]').click();
	await devtools.locator('[data-testid="filter-popup"]').waitFor();
	await devtools
		.locator('[data-testid="filter-popup"] label:has-text("HOC-Components")')
		.click();
	await devtools.locator('[data-testid="filter-update"]').click();

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").click();
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("withBoof(Wrapped)")).waitFor();
});
