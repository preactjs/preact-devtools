import { expect, test } from "@playwright/test";
import { enableHighlightUpdates, gotoTest } from "../../pw-utils";

test("Don't crash on measuring text nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "highlight-text");

	await enableHighlightUpdates(page, devtools);

	await page.locator("button").click({ noWaitAfter: true });

	const id = "#preact-devtools-highlight-updates";
	await page.locator(id).waitFor({ state: "attached" });
	await expect(page.locator(id)).toHaveCount(0);
});
