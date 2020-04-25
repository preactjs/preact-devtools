import { newTestPage, click, getText, clickNestedText } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";

export const description = "Sync selection from profiler";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	await clickNestedText(devtools, "Counter");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');
	await click(devtools, '[data-testid="record-btn"]');

	await click(page, "button");
	await click(devtools, '[data-testid="record-btn"]');

	await devtools.waitForSelector('[data-type="flamegraph"]');

	await clickNestedText(devtools, /^Displ/);

	await click(devtools, '[name="root-panel"][value="ELEMENTS"]');

	const text = await getText(devtools, "[data-selected]");
	expect(text).to.equal("Display");

	await closePage(page);
}
