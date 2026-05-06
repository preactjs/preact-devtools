import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Pressing Enter should scroll marked results into view during search #162", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "deep-tree");

	await devtools.locator('[data-name="App"]').waitFor();
	await devtools.locator('[data-testid="element-search"]').fill("Child");

	// Press Enter a bunch of times
	for (let i = 0; i < 24; i++) {
		await page.keyboard.press("Enter");
	}

	await expect(devtools.locator('[data-marked="true"]')).toBeVisible();
});
