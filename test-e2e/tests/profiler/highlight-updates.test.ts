import { expect, test } from "@playwright/test";
import { enableHighlightUpdates, gotoTest } from "../../pw-utils";

test("Check if highlight updates is rendered", async ({ page }) => {
	const { devtools } = await gotoTest(page, "todo");

	await enableHighlightUpdates(page, devtools);

	const id = "#preact-devtools-highlight-updates";

	// Run twice to check if canvas is re-created
	for (let i = 0; i < 2; i++) {
		await page.locator("input").type("foo");
		await page.keyboard.press("Enter");

		await page.locator(id).waitFor({ state: "attached" });
		await expect(page.locator(id)).toHaveCount(0);
	}
});
