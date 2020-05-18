import { newTestPage, click, getText, clickTab } from "../../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Captures render reasons";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "render-reasons");

	// Enable Capturing
	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testid="toggle-render-reason"]');

	// Start profiling
	await clickTab(devtools, "PROFILER");
	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await click(page, '[data-testid="counter-1"]');
	await click(page, '[data-testid="class-state-multi"]');
	await click(page, '[data-testid="counter-2"]');
	await click(page, '[data-testid="force-update"]');
	await wait(1000);

	await click(devtools, recordBtn);

	// Class state
	await clickText(devtools, "ComponentState", { elementXPath: "//*" });
	let reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("State changed:value");

	await clickText(devtools, "Display", { elementXPath: "//*" });
	reasons = await getText(devtools, '[data-testid="render-reasons"]');
	expect(reasons).to.equal("Props changed:value");

	// Reset flamegraph
	await clickText(devtools, "Fragment", { elementXPath: "//*" });

	// Class state multiple
	await click(devtools, '[data-testid="next-commit"]');
	await clickText(devtools, "ComponentMultiState", { elementXPath: "//*" });
	reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("State changed:counter, other");

	// Reset flamegraph
	await clickText(devtools, "Fragment", { elementXPath: "//*" });

	// Hooks
	await click(devtools, '[data-testid="next-commit"]');

	await wait(1000);
	await clickText(devtools, "HookState", {
		elementXPath: "//*",
		timeout: 2000,
	});
	reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("Hooks changed");

	await clickText(devtools, "Fragment", {
		elementXPath: "//*",
		timeout: 2000,
	});

	// Force update
	await click(devtools, '[data-testid="next-commit"]');

	await wait(1000);
	await clickText(devtools, "ForceUpdate", {
		elementXPath: "//*",
		timeout: 2000,
	});
	reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("Force update");

	await closePage(page);
}
