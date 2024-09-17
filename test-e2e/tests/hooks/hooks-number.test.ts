import { expect, test } from "@playwright/test";
import { clickTreeItem, gotoTest } from "../../pw-utils.ts";

test("Show hook number", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-multiple");

	await clickTreeItem(devtools, "App");

	const nums = await devtools
		.locator('[data-testid="Hooks"] .hook-number')
		.allTextContents();

	expect(nums).toEqual(["1", "2", "3", "4", "5"]);
});

test("Show hook number only for top level items", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-expand");

	await clickTreeItem(devtools, "Memo");

	await devtools.click('[data-testid="props-row"] button');
	await devtools.waitForSelector('[data-testid="props-row"][data-depth="2"]');

	const nums = await devtools
		.locator('[data-testid="Hooks"] .hook-number')
		.allTextContents();

	expect(nums).toEqual(["1"]);
});
