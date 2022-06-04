import {
	newTestPage,
	clickTab,
	waitForSelector,
	clickRecordButton,
} from "../../test-utils";
import { getText, waitForTestId, clickSelector } from "pentf/browser_utils";
import { expect } from "chai";

export const description = "Skip memoized components for stats";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "memo-stats");

	await clickTab(devtools, "STATISTICS");
	await waitForTestId(devtools, "stats-info");

	await clickRecordButton(devtools);

	await clickSelector(page, "button");
	await waitForSelector(page, '[data-value="1"]');
	await clickRecordButton(devtools);

	const mountTotal = await getText(devtools, '[data-testid="mount-total"]');
	expect(mountTotal).to.equal("0");

	const updateTotal = await getText(devtools, '[data-testid="update-total"]');
	expect(updateTotal).to.equal("8");

	const unmountTotal = await getText(devtools, '[data-testid="unmount-total"]');
	expect(unmountTotal).to.equal("0");
}
