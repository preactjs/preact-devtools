import { newTestPage, click, waitForAttribute } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pintf/browser_utils";

export const description =
	"Ranked profile view should only show nodes of the current commit";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-1");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');
	await click(devtools, '[name="flamegraph_mode"][value="RANKED"]');

	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await waitForAttribute(devtools, recordBtn, "title", /Stop Recording/);

	await click(page, "button");
	await click(page, "button");

	await click(devtools, recordBtn);

	const nodes = await devtools.$$(
		'[data-type="ranked"] > *:not([data-weight])',
	);
	expect(nodes.length).to.equal(0);

	await closePage(page);
}
