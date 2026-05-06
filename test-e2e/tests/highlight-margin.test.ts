import { expect, Frame, Page, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Highlight overlay should detect memo for margin", async ({ page }) => {
	const { devtools } = await gotoTest(page, "highlight-margin");

	await devtools.locator(locateTreeItem("Headline")).waitFor();

	await devtools.locator(locateTreeItem("Headline")).hover();
	await page.locator("#preact-devtools-highlighter > div").waitFor();

	await assertHighlight(page, '[data-testid="headline"]', (el, hl) => {
		return el.top > hl.top && el.left === hl.left;
	});

	await devtools.locator(locateTreeItem("MarginBox")).hover();
	await assertHighlight(page, '[data-testid="margin-box"]', (el, hl) => {
		return el.top > hl.top && el.left > hl.left;
	});

	await devtools.locator(locateTreeItem("BorderBox")).hover();
	await assertHighlight(page, '[data-testid="border-box"]', (el, hl) => {
		return el.top > hl.top && el.left > hl.left;
	});
});

async function assertHighlight(
	page: Page,
	targetSelector: string,
	check: (
		element: { top: number; left: number },
		highlight: { top: number; left: number },
	) => boolean,
) {
	await expect
		.poll(async () => {
			const element = await page.$eval(targetSelector, el =>
				el.getBoundingClientRect().toJSON(),
			);
			const highlight = await getHighlightSize(page);
			return check(element, highlight);
		})
		.toBe(true);
}

async function getHighlightSize(page: Frame | Page) {
	return await page.$eval("#preact-devtools-highlighter > div", el =>
		el.getBoundingClientRect().toJSON(),
	);
}
