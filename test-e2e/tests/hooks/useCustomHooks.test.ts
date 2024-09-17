import { expect, test } from "@playwright/test";
import { gotoTest, locateHook, locateTreeItem } from "../../pw-utils.ts";

test("Inspect custom hooks", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks");

	await devtools.locator(locateTreeItem("CustomHooks")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await devtools
		.locator(
			'[data-testid="Hooks"] [data-testid="props-row"] button[data-collapsed="true"]',
		)
		.waitFor();

	await expect(
		devtools.locator('[data-testid="Hooks"] [data-testid="props-row"]'),
	).toHaveCount(1);

	await devtools.locator(locateHook("useFoo")).click();
	await expect(
		devtools.locator('[data-testid="Hooks"] [data-testid="props-row"]'),
	).toHaveCount(2);

	await devtools.locator(locateHook("useBar")).click();
	await expect(
		devtools.locator('[data-testid="Hooks"] [data-testid="props-row"]'),
	).toHaveCount(4);

	// Collapse all hooks
	await devtools.locator(locateHook("useFoo")).click();
	await expect(
		devtools.locator('[data-testid="Hooks"] [data-testid="props-row"]'),
	).toHaveCount(1);
});
