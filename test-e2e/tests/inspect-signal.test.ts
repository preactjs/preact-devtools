import { test, expect } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Show signal in props and update value", async ({ page }) => {
	test.skip(
		process.env.PREACT_VERSION !== "10",
		"Signals are not supported in v11 yet.",
	);
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

test("Dectect signal subscriptions", async ({ page }) => {
	test.skip(
		process.env.PREACT_VERSION !== "10",
		"Signals are not supported in v11 yet.",
	);
	const { devtools } = await gotoTest(page, "signals-subscribe");

	await devtools.click(locateTreeItem("App"));

	await devtools.waitForSelector('[data-testid="Signals"]');
	await devtools.waitForSelector('[data-testid="props-row"]');
	await expect(
		devtools.locator('[data-testid="Signals"] [data-testid="props-row"]'),
	).toHaveCount(2);

	await devtools
		.locator('[data-testid="Signals"] [data-testid="prop-name"]:has-text("0")')
		.click();
	await devtools
		.locator('[data-testid="Signals"] [data-testid="prop-value"] input')
		.fill("");
	await devtools
		.locator('[data-testid="Signals"] [data-testid="prop-value"] input')
		.type("10");
	await page.keyboard.press("Enter");

	await page.locator("p:has-text('count: 10, double: 20')").waitFor();
});

// https://github.com/preactjs/preact-devtools/issues/456
test("Don't crash when signal hook is updated", async ({ page }) => {
	test.skip(
		process.env.PREACT_VERSION !== "10",
		"Signals are not supported in v11 yet.",
	);
	const { devtools } = await gotoTest(page, "signals");

	await devtools.click(locateTreeItem("Counter"));
	await devtools.waitForSelector('[data-testid="props-row"]');

	await devtools.click(
		'[data-testid="Hooks"] form [data-testid="props-row"]:first-child button',
	);

	await devtools.waitForSelector(
		'[data-testid="Hooks"] [data-testid="prop-value"]:has-text("ƒ Signal (0)")',
	);

	await page.click("button:has-text('Add')");
	await page.click("button:has-text('Add')");

	await devtools.click(locateTreeItem("Display"));
	await expect(devtools.locator('[data-testid="Hooks"]')).toHaveCount(0);

	await devtools.click(locateTreeItem("Counter"));
	await expect(devtools.locator('[data-testid="Hooks"]')).toHaveCount(1);
});
