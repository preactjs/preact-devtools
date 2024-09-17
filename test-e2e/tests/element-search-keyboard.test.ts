import { test } from "@playwright/test";
import { gotoTest, waitFor } from "../pw-utils.ts";

test("Pressing Enter should scroll marked results into view during search #162", async ({ page }) => {
	const { devtools } = await gotoTest(page, "deep-tree");

	await devtools.waitForSelector('[data-name="App"]');
	await devtools.type('[data-testid="element-search"]', "Child");

	// Press Enter a bunch of times
	for (let i = 0; i < 24; i++) {
		await page.keyboard.press("Enter");
	}

	await waitFor(async () => {
		const marked = await devtools.$("[data-marked]");
		if (!marked) return false;
		return await marked!.isVisible();
	});
});
