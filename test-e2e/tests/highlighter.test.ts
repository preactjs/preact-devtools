import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Highlight item", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator(locateTreeItem("Counter")).waitFor();
	await devtools.locator(locateTreeItem("Counter")).hover();
	await page.locator("#preact-devtools-highlighter > div").waitFor();

	const sizeOnPage = await page.$eval("#app > div", el =>
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
