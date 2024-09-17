import { test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils.ts";

test("Display symbol values", async ({ page }) => {
	const { devtools } = await gotoTest(page, "symbols");

	// Hooks
	await devtools.click(locateTreeItem("SymbolComponent"));
	await devtools.waitForSelector('[data-testid="Hooks"]');
	await devtools
		.locator('[data-testid="prop-value"]:has-text("Symbol(foobar)")')
		.waitFor();

	// Props
	await devtools.click(locateTreeItem("Child"));
	await devtools.waitForSelector('[data-testid="Props"]');
	await devtools
		.locator('[data-testid="prop-value"]:has-text("Symbol(foobar)")')
		.waitFor();

	// State
	await devtools.click(locateTreeItem("ClassComponent"));
	await devtools.waitForSelector('[data-testid="State"]');
	await devtools
		.locator('[data-testid="prop-value"]:has-text("Symbol(foobar)")')
		.waitFor();
});
