import { test, expect } from "@playwright/test";
import { getHooks, gotoTest, locateTreeItem } from "../../pw-utils";

test("Show custom debug value complex", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-debug");

	await devtools.locator(locateTreeItem("App")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useFoo", '{foo: "bar"}']]);
});
