import { expect, test } from "@playwright/test";
import { gotoTest, locateTab, wait } from "../../pw-utils.ts";

test("Check if highlight updates is rendered", async ({ page }) => {
	const { devtools } = await gotoTest(page, "todo");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testId="toggle-highlight-updates"]');

	// Run twice to check if canvas is re-created
	for (let i = 0; i < 2; i++) {
		await page.locator("input").type("foo");
		await page.keyboard.press("Enter");

		const id = "#preact-devtools-highlight-updates";
		await page.waitForSelector(id, { state: "attached" });

		await wait(1000);
		await expect(page.locator(id)).toHaveCount(0);
	}
});
