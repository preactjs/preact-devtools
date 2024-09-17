import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem, wait } from "../pw-utils.ts";

test("Highlight Suspense nodes without crashing", async ({ page }) => {
	const { devtools } = await gotoTest(page, "suspense");

	await devtools.waitForSelector(locateTreeItem("Suspense"));
	await devtools.hover(locateTreeItem("Suspense"));
	// Wait for possible flickering to occur
	await wait(1000);

	const sizeOnPage = await page.$eval(
		'[data-testid="delayed"]',
		(el) => el.getBoundingClientRect(),
	);
	const sizeOfHighlight = await page.$eval(
		"#preact-devtools-highlighter > div",
		(el) => el.getBoundingClientRect(),
	);
	expect(sizeOfHighlight).toEqual(sizeOnPage);
});
