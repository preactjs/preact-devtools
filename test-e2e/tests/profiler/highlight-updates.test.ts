import { expect, test } from "@playwright/test";
import { locateTab, gotoTest } from "../../pw-utils";

test("Check if highlight updates is rendered", async ({ page }) => {
	const { devtools } = await gotoTest(page, "todo");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.locator('[data-testId="toggle-highlight-updates"]').click();

	const id = "#preact-devtools-highlight-updates";

	// Run twice to check if canvas is re-created
	for (let i = 0; i < 2; i++) {
		await page.locator("input").type("foo");
		await page.keyboard.press("Enter");

		await page.locator(id).waitFor({ state: "attached" });
		await expect(page.locator(id)).toHaveCount(0);
	}
});
