import {
	clickNestedText,
	clickTestId,
	getText,
	waitForTestId,
} from "pentf/browser_utils";
import { expect } from "chai";
import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
	waitForSelector,
} from "../../../test-utils";
import { wait } from "pentf/utils";

export const description = "Should work with filtered HOC roots";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hoc-update");

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	await waitForSelector(
		devtools,
		'[data-type="flamegraph"] [data-name="Wrapped"]',
		{ timeout: 3000 },
	);

	const labels = await getText(
		devtools,
		'[data-type="flamegraph"] [data-name="Wrapped"] [data-testid="hoc-labels"]',
	);

	expect(labels).to.equal("withBoof");

	// Disabling HOC-filter should remove hoc labels
	await clickTab(devtools, "ELEMENTS");
	await clickTestId(devtools, "filter-menu-button");
	await waitForTestId(devtools, "filter-popup");
	await clickNestedText(devtools, "HOC-Components");
	await clickTestId(devtools, "filter-update");
	await wait(1000);

	await clickTab(devtools, "PROFILER");
	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	await waitForSelector(
		devtools,
		'[data-type="flamegraph"] [data-name="withBoof(Wrapped)"]',
	);
}
