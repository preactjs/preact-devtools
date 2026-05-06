import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, locateTreeItem } from "../pw-utils";

test("Display no stats initially", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-all");

	await devtools.locator('[data-testid="tree-item"]').first().waitFor();

	// All elements in the tree view should be uncollapsed initially
	await expect(
		devtools.locator('[data-testid="tree-item"] [data-collapsed="true"]'),
	).toHaveCount(0);

	// Should be able to collapse tree
	const rows = await devtools.locator('[data-testid="tree-item"]').count();

	await devtools.locator('[data-testid="tree-item"] button').first().click();

	await expect(devtools.locator('[data-testid="tree-item"]')).not.toHaveCount(
		rows,
	);

	// Restore view
	await devtools.locator('[data-testid="tree-item"] button').first().click();

	// Props should be collapsed by default
	await devtools.locator(locateTreeItem("Provider")).click();
	const row = '[data-testid="props-row"]';
	await devtools.locator(row).first().waitFor();

	const selector = `${row} [data-collapsed="true"]`;
	await expect(devtools.locator(selector)).toHaveCount(1);

	await devtools.locator(`${row} button`).first().click();
	await expect(devtools.locator(selector)).toHaveCount(0);

	await devtools.locator(`${row} input`).first().click();
	await page.keyboard.press("ArrowUp");
	await page.keyboard.press("Enter");

	// Our input should still be visible
	await expect(devtools.locator(selector)).toHaveCount(0);

	// Switching to Profiler and back should not change collapse state
	await devtools.locator(locateTab("PROFILER")).click();
	await devtools.locator('[data-testid="record-btn"]').first().waitFor();
	await devtools.locator(locateTab("ELEMENTS")).click();

	await expect(devtools.locator(row).first()).toBeAttached();
	await expect(devtools.locator(selector)).toHaveCount(0);
});
