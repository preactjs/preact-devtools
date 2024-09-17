import { expect, test } from "@playwright/test";
import { gotoTest, locateTab, wait } from "../../pw-utils.ts";

test("Don't crash on measuring text nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "highlight-text");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testId="toggle-highlight-updates"]');

	await page.click("button", { noWaitAfter: true });

	// Run twice to check if canvas is re-created
	const id = "#preact-devtools-highlight-updates";
	await page.waitForSelector(id, { state: "attached" });

	await wait(1000);
	await expect(page.locator(id)).toHaveCount(0);
});
