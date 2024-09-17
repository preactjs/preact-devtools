import { expect, test } from "@playwright/test";
import { gotoTest, waitForPass } from "../pw-utils.ts";

test("Show vnode key in the sidebar", async ({ page }) => {
	const { devtools } = await gotoTest(page, "keys");
	await page.context().grantPermissions(["clipboard-read"]);

	await devtools
		.locator(`[data-testid="tree-item"]:has-text('key="ABC"')`)
		.click();
	await devtools.waitForSelector('[data-testid="key-panel"]');

	const text = await devtools
		.locator('[data-testid="vnode-key"]')
		.textContent();
	expect(text).toEqual("ABC");

	const copy = '[data-testid="key-panel"] button[title="Copy Key"]';
	await devtools.click(copy);

	const clipboard = await page.evaluate(() => navigator.clipboard.readText());
	expect(JSON.parse(clipboard)).toEqual("ABC");

	// Check that the keypanel is not present for keyless components
	await devtools.click('[data-name="NoKey"]');
	await waitForPass(async () => {
		expect(await devtools.locator('[data-testid="key-panel"]').count()).toEqual(
			0,
		);
	});
});
