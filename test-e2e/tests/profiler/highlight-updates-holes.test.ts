import { expect, test } from "@playwright/test";
import { gotoTest, locateTab } from "../../pw-utils.ts";

test("Check if highlight updates is rendered", async ({ page }) => {
	const { devtools } = await gotoTest(page, "holes");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testId="toggle-highlight-updates"]');

	const errors: string[] = [];
	page.on("pageerror", (err) => errors.push(err.toString()));

	await page.click("button");
	await page.click("button");

	expect(errors).toEqual([]);
});
