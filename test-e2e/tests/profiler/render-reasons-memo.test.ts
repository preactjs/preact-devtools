import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
	waitForSelector,
} from "../../test-utils";
import { expect } from "chai";
import { Page } from "puppeteer";
import { wait } from "pentf/utils";
import { getText } from "pentf/browser_utils";

export const description = "Captures render reasons for memo";

async function clickFlameNode(page: Page, name: string) {
	const selector = `[data-name="${name}"]`;
	await waitForSelector(page, selector, { timeout: 3000 });
	await click(page, selector);
	await waitForSelector(page, `${selector}[data-selected="true"]`, {
		timeout: 3000,
	});

	// Wait for animations (0.3s)
	await wait(300);
}

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "render-reasons-memo");

	// Enable Capturing
	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testid="toggle-render-reason"]');

	// Start profiling
	await clickTab(devtools, "PROFILER");
	await clickRecordButton(devtools);
	await click(page, "button");

	// Wait for profiler to flush
	await wait(500);
	await clickRecordButton(devtools);
	await clickFlameNode(devtools, "Fragment");

	// Get render reason
	await clickFlameNode(devtools, "Foo");
	const reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("Did not render");

	// Elements should be marked as not rendered
	const Foo = await devtools.evaluate(() => {
		const el = document.querySelector('[data-name="Foo"]');
		return el !== null && el.getAttribute("data-weight");
	});
	const Inner = await devtools.evaluate(() => {
		const el = document.querySelector('[data-name="Foo"]');
		return el !== null && el.getAttribute("data-weight");
	});

	expect(Foo).to.equal("-1");
	expect(Inner).to.equal("-1");
}
