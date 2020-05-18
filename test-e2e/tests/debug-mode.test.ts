import {
	newTestPage,
	click,
	clickTab,
	getAttribute,
	checkNotPresent,
} from "../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pentf/browser_utils";
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
	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await click(page, "button");
	await click(page, "button");

	await click(devtools, recordBtn);
	await clickText(devtools, "Counter", { elementXPath: "//*" });

	await checkNotPresent(devtools, '[data-testid="profiler-debug-stats"]');
	await checkNotPresent(devtools, '[data-testid="profiler-debug-nav"]');

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

	await devtools.waitForSelector('[data-testid="profiler-debug-stats"]');
	await devtools.waitForSelector('[data-testid="profiler-debug-nav"]');

	await closePage(page);
}
