import {
	newTestPage,
	click,
	getText$$,
	clickTab,
	clickRecordButton,
} from "../../../test-utils";
import { expect } from "chai";

export const description =
	"Not rendered nodes that are not parents of the current commit should be striped out";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-2");

	await clickTab(devtools, "PROFILER");
	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	let nodes = await getText$$(
		devtools,
		'[data-type="flamegraph"] > *:not([data-weight="-1"])',
	);
	expect(nodes.map(n => n.split(" ")[0])).to.deep.equal(["Counter", "Display"]);
	nodes = await getText$$(
		devtools,
		'[data-type="flamegraph"] > [data-commit-parent]',
	);
	expect(nodes.map(n => n.split(" ")[0])).to.deep.equal(["Fragment", "App"]);
}
