import {
	newTestPage,
	click,
	waitForAttribute,
	clickNestedText,
	getCount,
	getAttribute$$,
} from "../../test-utils";
import { expect } from "chai";
import { closePage, waitForTestId } from "pentf/browser_utils";

export const description = "Show in which commit a node rendered";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "root-multi");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');

	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await waitForAttribute(devtools, recordBtn, "title", /Stop Recording/);

	await click(page, "#app button");
	await click(page, "#app2 button");
	await click(page, "#app button");
	await click(page, "#app2 button");

	await click(devtools, recordBtn);

	await clickNestedText(devtools, "Counter");
	await waitForTestId(devtools, "rendered-at");

	const items = await getCount(devtools, '[data-testid="rendered-at"] button');
	expect(items).to.equal(2);

	let commits = await getAttribute$$(
		devtools,
		'[data-testid="commit-item"]',
		"data-selected",
	);
	expect(commits).to.deep.equal(["true", null, null, null]);

	const btns = await getAttribute$$(
		devtools,
		'[data-testid="rendered-at"] button',
		"data-active",
	);
	expect(btns).to.deep.equal(["true", null]);

	await click(
		devtools,
		'[data-testid="rendered-at"] button:not([data-active])',
	);

	commits = await getAttribute$$(
		devtools,
		'[data-testid="commit-item"]',
		"data-selected",
	);
	expect(commits).to.deep.equal([null, null, "true", null]);

	await closePage(page);
}
