import { newTestPage, clickTab, clickRecordButton } from "../../test-utils";
import { getText, waitForTestId, clickTestId } from "pentf/browser_utils";
import { expect } from "chai";

export const description = "Display single child stats";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "simple-stats");

	await clickTab(devtools, "STATISTICS");
	await waitForTestId(devtools, "stats-info");

	await clickRecordButton(devtools);
	await waitForTestId(devtools, "stats-info-recording");

	await clickTestId(page, "update");
	await clickRecordButton(devtools);

	const classComponents = await getText(
		devtools,
		'[data-testid="single-class-component"]',
	);
	expect(classComponents).to.equal("0");

	const functionComponents = await getText(
		devtools,
		'[data-testid="single-function-component"]',
	);
	expect(functionComponents).to.equal("0");

	const elements = await getText(devtools, '[data-testid="single-element"]');
	expect(elements).to.equal("2");
	const texts = await getText(devtools, '[data-testid="single-text"]');
	expect(texts).to.equal("3");
}
