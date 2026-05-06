import { expect, test } from "@playwright/test";
import { locateTab, gotoTest } from "../../pw-utils";

test("Don't crash on measuring text nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "highlight-text");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.locator('[data-testId="toggle-highlight-updates"]').click();

	await page.locator("button").click({ noWaitAfter: true });

	const id = "#preact-devtools-highlight-updates";
	await page.locator(id).waitFor({ state: "attached" });
	await expect(page.locator(id)).toHaveCount(0);
});
