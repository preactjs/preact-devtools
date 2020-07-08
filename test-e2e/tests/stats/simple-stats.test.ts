import { newTestPage, clickTab } from "../../test-utils";
import { closePage, getText, waitForTestId } from "pentf/browser_utils";
import { expect } from "chai";

export const description = "Display simple stats";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "simple-stats", {
		preact: "next",
	});

	await clickTab(devtools, "STATISTICS");
	await waitForTestId(devtools, "vnode-stats");

	const classComponents = await getText(
		devtools,
		'[data-testid="class-component-count',
	);
	expect(classComponents).to.equal("1");

	const functionComponents = await getText(
		devtools,
		'[data-testid="function-component-count',
	);
	expect(functionComponents).to.equal("1");

	const fragmentsCount = await getText(
		devtools,
		'[data-testid="fragments-count',
	);
	expect(fragmentsCount).to.equal("1");

	const elementsCount = await getText(devtools, '[data-testid="elements-count');
	expect(elementsCount).to.equal("4");

	const textCount = await getText(devtools, '[data-testid="text-count');
	expect(textCount).to.equal("6");

	// await closePage(page);
}
