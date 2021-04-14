import { newTestPage, getSize } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";
import { waitForSelector } from "pentf/browser_utils";
import type { Page } from "puppeteer";

function getHighlightSize(page: Page): unknown {
	return getSize(page, "#preact-devtools-highlighter > div");
}

export const description = "Highlight Suspense nodes without crashing";
export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "suspense");

	await waitForSelector(
		devtools,
		'[data-testid="tree-item"][data-name="Suspense"]',
	);

	await devtools.hover('[data-testid="tree-item"][data-name="Suspense"]');
	// Wait for possible flickering to occur
	await wait(1000);

	const sizeOnPage = await getSize(page, '[data-testid="delayed"]');
	const sizeOfHighlight = await getHighlightSize(page);
	expect(sizeOfHighlight).to.eql(sizeOnPage);
}
