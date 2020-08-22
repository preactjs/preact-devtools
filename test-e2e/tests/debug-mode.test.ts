import { newTestPage, click, clickTab, clickRecordButton } from "../test-utils";
import { expect } from "chai";
import {
	assertNotTestId,
	clickNestedText,
	getAttribute,
	waitForTestId,
} from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Debug mode toggles debug views";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	// Enable Capturing
	await clickTab(devtools, "SETTINGS");
	expect(
		await getAttribute(
			devtools,
			'[data-testid="toggle-debug-mode"]',
			"checked",
		),
	).to.equal(false);

	// Start profiling
	await clickTab(devtools, "PROFILER");
	await clickRecordButton(devtools);
	await click(page, "button");
	await click(page, "button");
	await clickRecordButton(devtools);
	await clickNestedText(devtools, "Counter");

	await assertNotTestId(devtools, "profiler-debug-stats");
	await assertNotTestId(devtools, "profiler-debug-nav");

	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testid="toggle-debug-mode"]');

	await wait(100);

	expect(
		await getAttribute(
			devtools,
			'[data-testid="toggle-debug-mode"]',
			"checked",
		),
	).to.equal(true);
	await clickTab(devtools, "PROFILER");

	await waitForTestId(devtools, "profiler-debug-stats");
	await waitForTestId(devtools, "profiler-debug-nav");
}
