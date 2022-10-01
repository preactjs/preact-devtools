import { test, expect } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Show signal in props and update value", async ({ page }) => {
	const { devtools } = await gotoTest(page, "signals");

	await devtools.locator(locateTreeItem("Display")).first().click();

	await devtools.waitForSelector('[data-testid="props-row"]');

	let preview = await devtools
		.locator('[data-testid="prop-value"]:has-text("Signal")')
		.textContent();

	expect(preview).toEqual("ƒ Signal (0)");

	await devtools.locator('[data-type="signal"]').click();
	await devtools.locator('input[name="root.value.value"]').focus();
	await page.keyboard.press("ArrowUp");
	await page.keyboard.press("Enter");

	await page.locator("#result:has-text('value: 1,double: 2')").waitFor();

	preview = await devtools
		.locator('[data-testid="prop-value"]:has-text("Signal")')
		.textContent();

	expect(preview).toEqual("ƒ Signal (1)");
});

test("Show computed signal as readonly", async ({ page }) => {
	const { devtools } = await gotoTest(page, "signals");

	await devtools.click(locateTreeItem("Display") + ":nth-child(2n)");

	await devtools.waitForSelector('[data-testid="props-row"]');

	const preview = await devtools
		.locator('[data-testid="prop-value"]:has-text("Signal")')
		.textContent();

	expect(preview).toEqual("ƒ computed Signal (0)");

	await devtools.locator('[data-type="signal"]').click();

	// Computed signal should not be editable
	await devtools.locator('[data-testid="props-row"][data-depth="2"]').waitFor();
	await expect(
		devtools.locator('[data-testid="props-row"][data-depth="2"] input'),
	).toHaveCount(0);
});

test("Show signals in hooks", async ({ page }) => {
	const { devtools } = await gotoTest(page, "signals");

	await devtools.click(locateTreeItem("Counter"));

	await devtools.waitForSelector('[data-testid="props-row"]');
	await devtools
		.locator(
			'[data-testid="props-row"] [data-testid="prop-name"]:has-text("_")',
		)
		.click();
	await devtools
		.locator(
			'[data-testid="props-row"] [data-testid="prop-name"]:has-text("useMemo")',
		)
		.click();
	await expect(
		devtools.locator(
			'[data-testid="props-row"] [data-testid="prop-name"]:has-text("value")',
		),
	).toHaveCount(1);
});
