import {
	newTestPage,
	click,
	waitForAttribute,
	getSize,
} from "../../../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";
import { getFlameNodes } from "./utils";

export const description = "Correctly position memoized sub-trees";

// TODO: Test case is flakey
export const skip = () => true;

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "memo");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');

	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await waitForAttribute(devtools, recordBtn, "title", /Stop Recording/);

	await click(page, "button");

	await click(devtools, recordBtn);

	const nodes = await getFlameNodes(devtools);
	expect(nodes).to.deep.equal([
		{ maximized: true, name: "Fragment", visible: true },
		{ maximized: false, name: "Counter", visible: true },
		{ maximized: false, name: "Memo(Display)", visible: true },
		{ maximized: false, name: "Display", visible: true },
		{ maximized: false, name: "Value", visible: true },
		{ maximized: false, name: "Value", visible: true },
	]);

	const memoSize = await getSize(
		devtools,
		'[data-type="flamegraph"] *:nth-child(3)',
	);
	const staticSize = await getSize(
		devtools,
		'[data-type="flamegraph"] *:nth-child(4)',
	);

	expect(memoSize.x <= staticSize.x).to.equal(true);
	expect(
		memoSize.x + memoSize.width >= staticSize.x + staticSize.width,
	).to.equal(true);

	await closePage(page);
}
