import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Highlight Suspense nodes without crashing", async ({ page }) => {
	const { devtools } = await gotoTest(page, "suspense");

	await devtools.locator(locateTreeItem("Suspense")).waitFor();
	// The Delayed component resolves after a timeout
	await page.locator('[data-testid="delayed"]').waitFor();
	await devtools.locator(locateTreeItem("Suspense")).hover();
	await page.locator("#preact-devtools-highlighter > div").waitFor();

	const sizeOnPage = await page.$eval('[data-testid="delayed"]', el =>
		el.getBoundingClientRect().toJSON(),
	);
	await expect
		.poll(() =>
			page.$eval("#preact-devtools-highlighter > div", el =>
				el.getBoundingClientRect().toJSON(),
			),
		)
		.toEqual(sizeOnPage);
});
