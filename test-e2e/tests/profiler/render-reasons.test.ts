import {
	newTestPage,
	click,
	getText,
	clickTab,
	clickRecordButton,
} from "../../test-utils";
import { expect } from "chai";
import { Page } from "puppeteer";
import { wait } from "pentf/utils";

export const description = "Captures render reasons";

async function clickFlameNode(page: Page, name: string) {
	const selector = `[data-name="${name}"]`;
	await page.waitForSelector(selector, { timeout: 3000 });
	await click(page, selector);
	await page.waitForSelector(`${selector}[data-selected="true"]`, {
		timeout: 3000,
	});

	// Wait for animations (0.3s)
	await wait(300);
}

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "render-reasons");

	// Enable Capturing
	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testid="toggle-render-reason"]');

	// Start profiling
	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);

	await click(page, '[data-testid="counter-1"]');
	await click(page, '[data-testid="class-state-multi"]');
	await click(page, '[data-testid="counter-2"]');
	await click(page, '[data-testid="force-update"]');

	// Wait for P

	await clickRecordButton(devtools);
	await clickFlameNode(devtools, "Fragment");

	// Class state
	await clickFlameNode(devtools, "ComponentState");
	let reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("State changed:value");

	await clickFlameNode(devtools, "Fragment");
	await clickFlameNode(devtools, "Display");
	reasons = await getText(devtools, '[data-testid="render-reasons"]');
	expect(reasons).to.equal("Props changed:value");

	// Class state multiple
	await click(devtools, '[data-testid="next-commit"]');
	await clickFlameNode(devtools, "Fragment");

	await clickFlameNode(devtools, "ComponentMultiState");
	reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("State changed:counter, other");

	// Hooks
	await click(devtools, '[data-testid="next-commit"]');
	await clickFlameNode(devtools, "Fragment");

	await clickFlameNode(devtools, "HookState");
	reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("Hooks changed");

	// Force update
	await click(devtools, '[data-testid="next-commit"]');
	await clickFlameNode(devtools, "Fragment");

	await clickFlameNode(devtools, "ForceUpdate");
	reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("Force update");
}
