import { test, expect } from "@playwright/test";
import { getProps, gotoTest, locateTreeItem } from "../pw-utils";

test("Test keyboard navigation in elements tree", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator(locateTreeItem("Counter")).click();
	await expect
		.poll(async () => Object.keys(await getProps(devtools)))
		.toEqual([]);

	const prop = '[data-testid="Props"] [data-testid="props-row"]';

	await page.keyboard.press("ArrowDown");
	await expect(devtools.locator('[data-selected="true"]')).toHaveText(
		"Display",
	);
	await expect(devtools.locator(prop)).toHaveCount(1);

	await page.keyboard.press("ArrowUp");
	await expect(devtools.locator('[data-selected="true"]')).toHaveText(
		"Counter",
	);
	await expect(devtools.locator(prop)).toHaveCount(0);
});
