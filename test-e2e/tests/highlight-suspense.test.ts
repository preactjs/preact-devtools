import { newTestPage, getSize } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";

import type { Page } from "puppeteer";

export const description = "Display and highlighting of Suspense in devtools";

function getHighlightSize(page: Page): unknown {
	return getSize(page, "#preact-devtools-highlighter > div");
}

export async function run(config: any): Promise<void> {
	const { page, devtools } = await newTestPage(config, "suspense");

	// TODO: would expect tree-item list to be:
	//   ["Block", "Shortly", "Suspense", "Delayed", "Block"]
	// but is actually:
	//   ["Block", "Shortly", "Suspense", "m"]

	await devtools.hover('[data-testid="tree-item"][data-name="Suspense"]');
	// Wait for possible flickering to occur
	await wait(1000);
	const sizeOnPage = await getSize(page, '[data-testid="container"]');
	const sizeOfHighlight = await getHighlightSize(page);
	expect(sizeOfHighlight).to.eql(sizeOnPage);

	// TODO: expect size of delayed child to be correctly shown
}
