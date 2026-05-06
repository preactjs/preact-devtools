import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Large tree perf fixture can switch sizes and update", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "perf-large-tree");

	await expect(page.locator('[data-testid="perf-status"]')).toContainText(
		"1,000 nodes",
	);
	await devtools.locator(locateTreeItem("App")).waitFor();
	await devtools.locator(locateTreeItem("LargeTreeNode")).first().waitFor();

	await page.locator('[data-testid="perf-size-5000"]').click();
	await expect(page.locator('[data-testid="perf-status"]')).toContainText(
		"5,000 nodes",
	);

	await page.locator('[data-testid="perf-update"]').click();
	await expect(page.locator('[data-testid="perf-status"]')).toContainText(
		"update 1",
	);
});
