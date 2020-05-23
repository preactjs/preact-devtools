import { newTestPage, getSize } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";
import { wait } from "pentf/utils";
import { Page } from "puppeteer";

export const description = "Hihglight overlay should account for margin";

function getHighlightSize(page: Page) {
	return getSize(page, "#preact-devtools-highlighter > div");
}

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "highlight-margin");

	await devtools.hover('[data-testid="tree-item"][data-name="Headline"]');
	// Wait for possible flickering to occur
	await wait(1000);
	let element = await getSize(page, '[data-testid="headline"]');
	let highlight = await getHighlightSize(page);
	expect(element.top > highlight.top).to.equal(true);
	expect(element.left === highlight.left).to.equal(true);

	await devtools.hover('[data-testid="tree-item"][data-name="MarginBox"]');
	await wait(1000);
	element = await getSize(page, '[data-testid="margin-box"]');
	highlight = await getHighlightSize(page);
	expect(element.top > highlight.top).to.equal(true);
	expect(element.left > highlight.left).to.equal(true);

	await devtools.hover('[data-testid="tree-item"][data-name="BorderBox"]');
	await wait(1000);
	element = await getSize(page, '[data-testid="border-box"]');
	highlight = await getHighlightSize(page);
	expect(element.top > highlight.top).to.equal(true);
	expect(element.left > highlight.left).to.equal(true);

	await closePage(page);
}
