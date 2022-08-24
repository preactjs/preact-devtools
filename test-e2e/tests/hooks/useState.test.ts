import { test, expect } from "@playwright/test";
import { getHooks, gotoTest, locateTreeItem } from "../../pw-utils";

test("Inspect useState hook", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks");

	await devtools.locator(locateTreeItem("Counter")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	const hooks = await getHooks(devtools);
	expect(hooks).toEqual([["useState", "0"]]);

	// Should not be collapsable
	await expect(
		devtools.locator('[data-testid="props-row"] > button'),
	).toHaveCount(0);

	// Should be editable
	await devtools
		.locator('[data-testid="Hooks"] [data-testid="prop-value"] input')
		.click();
	await page.keyboard.press("ArrowUp");
	await page.keyboard.press("Enter");

	const text = await page.locator('[data-testid="result"]').textContent();
	expect(text).toEqual("Counter: 1");
});
