import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Show vnode key in the sidebar", async ({ page }) => {
	const { devtools } = await gotoTest(page, "keys");
	await page.context().grantPermissions(["clipboard-read"]);

	await devtools
		.locator(`[data-testid="tree-item"]:has-text('key="ABC"')`)
		.click();
	await devtools.locator('[data-testid="key-panel"]').waitFor();

	await expect(devtools.locator('[data-testid="vnode-key"]')).toHaveText("ABC");

	const copy = '[data-testid="key-panel"] button[title="Copy Key"]';
	await devtools.locator(copy).click();

	await expect
		.poll(() => page.evaluate(() => navigator.clipboard.readText()))
		.toEqual(JSON.stringify("ABC"));

	// Check that the keypanel is not present for keyless components
	await devtools.locator('[data-name="NoKey"]').click();
	await expect(devtools.locator('[data-testid="key-panel"]')).toHaveCount(0);
});
