import { expect, test } from "@playwright/test";
import { enableHighlightUpdates, gotoTest } from "../../pw-utils";

test("Check if highlight updates is rendered", async ({ page }) => {
	const { devtools } = await gotoTest(page, "holes");

	await enableHighlightUpdates(page, devtools);

	const errors: string[] = [];
	page.on("pageerror", err => errors.push(err.toString()));

	await page.click("button");
	await page.click("button");

	expect(errors).toEqual([]);
});
