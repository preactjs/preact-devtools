import { test, expect } from "@playwright/test";
import { getHooks, gotoTest, locateTreeItem } from "../../pw-utils";

test("Show custom debug value", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks");

	await devtools.locator(locateTreeItem("DebugValue")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useMyHook", '"Offline"']]);

	await page.locator('[data-testid="debug-hook-toggle"]').click();

	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useMyHook", '"Online"']]);
});
