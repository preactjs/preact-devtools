import {
	newTestPage,
	click,
	getAttribute,
	waitForAttribute,
} from "../../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";

export const description = "Correctly position memoized sub-trees";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "memo");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');

	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await waitForAttribute(devtools, recordBtn, "title", /Stop Recording/);

	await click(page, "button");
	await click(page, "button");

	await click(devtools, recordBtn);

	const visible = await getAttribute(
		devtools,
		'[data-testid="flamegraph] > *:last-child',
		"data-visible",
	);
	expect(visible).to.equal(null);

	await closePage(page);
}
