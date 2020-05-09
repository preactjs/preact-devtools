import {
	newTestPage,
	click,
	waitForAttribute,
	getText$$,
} from "../../../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";

export const description =
	"Not rendered nodes that are not parents of the current commit should be striped out";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-2");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');

	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await waitForAttribute(devtools, recordBtn, "title", /Stop Recording/);

	await click(page, "button");

	await click(devtools, recordBtn);

	let nodes = await getText$$(
		devtools,
		'[data-type="flamegraph"] > *:not([data-weight="-1"])',
	);
	expect(nodes.map(n => n.split(" ")[0])).to.deep.equal(["Counter", "Display"]);
	nodes = await getText$$(
		devtools,
		'[data-type="flamegraph"] > [data-active-parent]',
	);
	expect(nodes.map(n => n.split(" ")[0])).to.deep.equal(["Fragment"]);

	await closePage(page);
}
