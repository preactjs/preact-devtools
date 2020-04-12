import { newTestPage, click, getText } from "../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pintf/browser_utils";
import { wait } from "pintf/utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "render-reasons");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');
	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await click(page, '[data-testid="counter-1"]');
	await click(page, '[data-testid="counter-2"]');
	await wait(1000);

	await click(devtools, recordBtn);

	await clickText(devtools, "ComponentState", { elementXPath: "//*" });
	let reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("State changed:value");

	await clickText(devtools, "Display", { elementXPath: "//*" });
	reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("Props changed:value");

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

	await closePage(page);
}
