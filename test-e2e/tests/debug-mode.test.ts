import { newTestPage, click, clickTab, clickRecordButton } from "../test-utils";
import { expect } from "chai";
import {
	assertNotTestId,
	clickNestedText,
	clickSelector,
	getAttribute,
	getText,
	waitForTestId,
} from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

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
	await clickSelector(page, "button", {
		async retryUntil() {
			const target = '[data-testid="result"]';
			return (await getText(page, target)) === "Counter: 1";
		},
	});
	await clickSelector(page, "button", {
		async retryUntil() {
			const target = '[data-testid="result"]';
			return (await getText(page, target)) === "Counter: 2";
		},
	});
	await clickRecordButton(devtools);
	await clickNestedText(devtools, "Counter");

	await assertNotTestId(devtools, "profiler-debug-stats");
	await assertNotTestId(devtools, "profiler-debug-nav");

	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testid="toggle-debug-mode"]');

	await waitForPass(async () => {
		expect(
			await getAttribute(
				devtools,
				'[data-testid="toggle-debug-mode"]',
				"checked",
			),
		).to.equal(true);
	});
	await clickTab(devtools, "PROFILER");

	await waitForTestId(devtools, "profiler-debug-stats");
	await waitForTestId(devtools, "profiler-debug-nav");
}
