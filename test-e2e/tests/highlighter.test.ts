import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem, wait } from "../pw-utils";

test("Highlight item", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.waitForSelector(locateTreeItem("Counter"));
	await devtools.hover(locateTreeItem("Counter"));
	// Wait for possible flickering to occur
	await wait(1000);

	const sizeOnPage = await page.$eval("#app > div", el =>
		el.getBoundingClientRect(),
	);
	const sizeOfHighlight = await page.$eval(
		"#preact-devtools-highlighter > div",
		el => el.getBoundingClientRect(),
	);
	expect(sizeOfHighlight).toEqual(sizeOnPage);
});
