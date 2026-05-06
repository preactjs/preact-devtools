import { test, expect } from "@playwright/test";
import { clickTreeItem, gotoTest } from "../../pw-utils";

test("Show hook number", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-multiple");

	await clickTreeItem(devtools, "App");

	await expect(
		devtools.locator('[data-testid="Hooks"] .hook-number'),
	).toHaveText(["1", "2", "3", "4", "5"]);
});

test("Show hook number only for top level items", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-expand");

	await clickTreeItem(devtools, "Memo");

	await devtools.locator('[data-testid="props-row"] button').first().click();
	await devtools.locator('[data-testid="props-row"][data-depth="2"]').waitFor();

	await expect(
		devtools.locator('[data-testid="Hooks"] .hook-number'),
	).toHaveText(["1"]);
});
