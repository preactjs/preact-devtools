import { newTestPage, clickTab } from "../../test-utils";
import {
	closePage,
	getText,
	waitForTestId,
	clickTestId,
} from "pentf/browser_utils";
import { expect } from "chai";

export const description = "Display simple stats";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "simple-stats", {
		preact: "next",
	});

	await clickTab(devtools, "STATISTICS");
	await waitForTestId(devtools, "stats-info");

	await clickTestId(devtools, "record-btn");
	await waitForTestId(devtools, "stats-info-recording");

	await clickTestId(page, "update");
	await clickTestId(devtools, "record-btn");

	const classComponents = await getText(
		devtools,
		'[data-testid="class-component-total"]',
	);
	expect(classComponents).to.equal("1");

	const functionComponents = await getText(
		devtools,
		'[data-testid="function-component-total"]',
	);
	expect(functionComponents).to.equal("1");

	const fragmentsCount = await getText(
		devtools,
		'[data-testid="fragment-total"]',
	);
	expect(fragmentsCount).to.equal("0");

	const elementsCount = await getText(devtools, '[data-testid="element-total');
	expect(elementsCount).to.equal("5");

	const textCount = await getText(devtools, '[data-testid="text-total');
	expect(textCount).to.equal("6");

	await closePage(page);
}
