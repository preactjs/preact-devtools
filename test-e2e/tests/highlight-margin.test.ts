import { expect, Frame, Page, test } from "@playwright/test";
import { gotoTest, locateTreeItem, wait } from "../pw-utils";

test("Highlight overlay should detect memo for margin", async ({ page }) => {
	const { devtools } = await gotoTest(page, "highlight-margin");

	await devtools.locator(locateTreeItem("Headline")).waitFor();

	await devtools.hover(locateTreeItem("Headline"));
	// Wait for possible flickering to occur
	await wait(1000);

	let element = await page.$eval('[data-testid="headline"]', el =>
		el.getBoundingClientRect(),
	);
	let highlight = await getHighlightSize(page);
	expect(element.top > highlight.top).toEqual(true);
	expect(element.left === highlight.left).toEqual(true);

	await devtools.hover(locateTreeItem("MarginBox"));
	await wait(1000);

	element = await page.$eval('[data-testid="margin-box"]', el =>
		el.getBoundingClientRect(),
	);
	highlight = await getHighlightSize(page);
	expect(element.top > highlight.top).toEqual(true);
	expect(element.left > highlight.left).toEqual(true);

	await devtools.hover(locateTreeItem("BorderBox"));
	await wait(1000);
	element = await page.$eval('[data-testid="border-box"]', el =>
		el.getBoundingClientRect(),
	);
	highlight = await getHighlightSize(page);
	expect(element.top > highlight.top).toEqual(true);
	expect(element.left > highlight.left).toEqual(true);
});

async function getHighlightSize(page: Frame | Page) {
	return await page.$eval("#preact-devtools-highlighter > div", el =>
		el.getBoundingClientRect(),
	);
}
