import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
} from "../../test-utils";
import { expect } from "chai";
import { clickText, getAttribute, getText } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Disables render reason capturing";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "render-reasons");

	// Enable Capturing
	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testid="toggle-render-reason"]');
	expect(
		await getAttribute(
			devtools,
			'[data-testid="toggle-render-reason"]',
			"checked",
		),
	).to.equal(true);

	// Start profiling
	await clickTab(devtools, "PROFILER");
	await clickRecordButton(devtools);

	await click(page, '[data-testid="counter-1"]');
	await click(page, '[data-testid="counter-2"]');
	await wait(1000);

	await clickRecordButton(devtools);

	await clickText(devtools, "ComponentState", { elementXPath: "//*" });
	let reasons = await getText(devtools, '[data-testid="render-reasons"');
	expect(reasons).to.equal("State changed:value");

	// Reset flamegraph
	await clickText(devtools, "Fragment", { elementXPath: "//*" });
	reasons = await getText(devtools, '[data-testid="render-reasons"]');
	expect(reasons).to.equal("Did not render");
}
