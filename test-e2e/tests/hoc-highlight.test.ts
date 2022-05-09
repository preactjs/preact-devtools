import { newTestPage, waitForSelector } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";
import { Page } from "puppeteer";

export const description =
	"HOC-Component original name should show in highlight";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hoc");

	await assertHighlightName(page, devtools, "Bar");
	await assertHighlightName(page, devtools, "Anonymous");
	await assertHighlightName(page, devtools, "Last");
}

async function assertHighlightName(page: Page, devtools: Page, name: string) {
	const selector = `[data-testid="tree-item"][data-name="${name}"]`;
	await waitForSelector(devtools, selector);

	await devtools.hover(selector);

	// Wait for possible flickering to occur
	await wait(1000);

	const raw = await page.evaluate(() => {
		return document.querySelector('[data-testid="highlight"]')!.textContent;
	});

	const match = raw!.match(/^(.*)\s[|]/)!;
	expect(match[1]).to.equal(name);
}
