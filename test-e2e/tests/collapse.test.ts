import {
	newTestPage,
	click,
	getLog,
	waitFor,
	clickTab,
	waitForSelector,
} from "../test-utils";
import { expect } from "chai";
import { clickNestedText } from "pentf/browser_utils";

export const description = "Collapse all the things!";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "update-all");

	await waitForSelector(devtools, '[data-testid="tree-item"]', {
		timeout: 1000,
	});

	// All elements in the tree view should be uncollapsed initially
	let collapsed = await devtools.$$(
		'[data-testid="tree-item"] [data-collapsed="true"]',
	);
	expect(collapsed.length).to.equal(0);

	// Should be able to collapse tree
	const rows = (await devtools.$$('[data-testid="tree-item"]')).length;

	await click(devtools, '[data-testid="tree-item"] button');

	const rowsAfter = (await devtools.$$('[data-testid="tree-item"]')).length;
	expect(rows).to.not.equal(rowsAfter);

	// Restore view
	await click(devtools, '[data-testid="tree-item"] button');

	// Props should be collapsed by default
	await clickNestedText(devtools, "Provider");
	const row = '[data-testid="props-row"]';
	await waitForSelector(devtools, row, {
		timeout: 1000,
	});

	const selector = `${row} [data-collapsed="true"]`;
	collapsed = await devtools.$$(selector);
	expect(collapsed.length).to.equal(1);

	await click(devtools, `${row} button`);
	expect((await devtools.$$(selector)).length).to.equal(0);

	await click(devtools, `${row} input`);
	await page.keyboard.press("ArrowUp");
	await page.keyboard.press("Enter");

	await waitFor(async () => {
		const log = await getLog(page as any);
		return log.filter(x => x.type === "inspect-result").length === 3;
	});

	// Our input should still be visible
	expect((await devtools.$$(selector)).length).to.equal(0);

	// Switching to Profiler and back should not change collapse state
	await clickTab(devtools, "PROFILER");
	await waitForSelector(devtools, '[data-testid="record-btn"]');
	await clickTab(devtools, "ELEMENTS");

	await waitFor(async () => (await devtools.$$(row)).length > 0);

	// Our input should still be visible
	expect((await devtools.$$(row)).length > 0).to.equal(true);
	expect((await devtools.$$(selector)).length).to.equal(0);
}
