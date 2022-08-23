import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, waitFor, locateTreeItem } from "../pw-utils";

test("Display no stats initially", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-all");

	await devtools.waitForSelector('[data-testid="tree-item"]');

	// All elements in the tree view should be uncollapsed initially
	let collapsed = await devtools
		.locator('[data-testid="tree-item"] [data-collapsed="true"]')
		.count();
	expect(collapsed).toEqual(0);

	// Should be able to collapse tree
	const rows = await devtools.locator('[data-testid="tree-item"]').count();

	await devtools.click('[data-testid="tree-item"] button');

	const rowsAfter = await devtools.locator('[data-testid="tree-item"]').count();
	expect(rows).not.toEqual(rowsAfter);

	// Restore view
	await devtools.click('[data-testid="tree-item"] button');

	// Props should be collapsed by default
	await devtools.locator(locateTreeItem("Provider")).click();
	const row = '[data-testid="props-row"]';
	await devtools.waitForSelector(row);

	const selector = `${row} [data-collapsed="true"]`;
	collapsed = await devtools.locator(selector).count();
	expect(collapsed).toEqual(1);

	await devtools.click(`${row} button`);
	expect(await devtools.locator(selector).count()).toEqual(0);

	await devtools.click(`${row} input`);
	await page.keyboard.press("ArrowUp");
	await page.keyboard.press("Enter");

	// Our input should still be visible
	expect(await devtools.locator(selector).count()).toEqual(0);

	// Switching to Profiler and back should not change collapse state
	await devtools.locator(locateTab("PROFILER")).click();
	await devtools.waitForSelector('[data-testid="record-btn"]');
	await devtools.locator(locateTab("ELEMENTS")).click();

	await waitFor(async () => (await devtools.$$(row)).length > 0);

	// Our input should still be visible
	expect((await devtools.$$(row)).length > 0).toEqual(true);
	expect((await devtools.$$(selector)).length).toEqual(0);
});
