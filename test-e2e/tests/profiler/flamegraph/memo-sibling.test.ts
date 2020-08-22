import {
	newTestPage,
	click,
	getSize,
	typeText,
	clickTab,
	clickRecordButton,
} from "../../../test-utils";
import { expect } from "chai";
import { clickTestId, waitForTestId } from "pentf/browser_utils";
import { getFlameNodes } from "./utils";

export const description = "Correctly position memoized sibling sub-trees";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "memo2");

	await clickTestId(devtools, "filter-menu-button");
	await waitForTestId(devtools, "filter-popup");
	await clickTestId(devtools, "add-filter");
	await typeText(
		devtools,
		'[data-testid="filter-popup"] input[type="text"]',
		"Display",
	);
	await click(
		devtools,
		'[data-testid="filter-popup"] input[type="checkbox"]:not(:checked)',
	);
	await clickTestId(devtools, "filter-update");
	await clickTestId(devtools, "filter-menu-button");

	await devtools.waitForFunction(() => {
		return document.querySelector('[data-testid="filter-popup"]') === null;
	});

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	const nodes = await getFlameNodes(devtools);
	expect(nodes).to.deep.equal([
		{ maximized: true, name: "Fragment", visible: true },
		{ maximized: false, name: "Counter", visible: true },
		{ maximized: false, name: "Value2", visible: true },
		{ maximized: false, name: "Value1", visible: true },
	]);

	const memoSize = await getSize(
		devtools,
		'[data-type="flamegraph"] *:nth-child(2)',
	);
	const staticSize1 = await getSize(
		devtools,
		'[data-type="flamegraph"] *:nth-child(3)',
	);
	const staticSize2 = await getSize(
		devtools,
		'[data-type="flamegraph"] *:nth-child(4)',
	);

	expect(memoSize.x <= staticSize1.x).to.equal(true);
	expect(
		memoSize.x + memoSize.width >= staticSize1.x + staticSize1.width,
	).to.equal(true);
	expect(memoSize.x <= staticSize2.x).to.equal(true);
	expect(
		memoSize.x + memoSize.width >= staticSize2.x + staticSize2.width,
	).to.equal(true);
}
