import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
} from "../../../test-utils";
import { expect } from "chai";
import { getText } from "pentf/browser_utils";

export const description =
	"Ranked profile view should only show nodes of the current commit";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-1");

	await clickTab(devtools, "PROFILER");
	await click(devtools, '[name="flamegraph_mode"][value="RANKED"]');

	await clickRecordButton(devtools);
	await click(page, "button");
	await click(page, "button");
	await clickRecordButton(devtools);

	const nodes = await devtools.$$(
		'[data-type="ranked"] > *:not([data-weight])',
	);
	expect(nodes.length).to.equal(0);

	// Only shows self time
	const text = await getText(
		devtools,
		'[data-type="ranked"] [data-weight]:first-child',
	);
	expect(text).to.match(/Counter \([0-9]+(\.[0-9]+)?ms\)/);
}
