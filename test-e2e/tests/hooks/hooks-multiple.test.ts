import { expect, test } from "@playwright/test";
import {
	clickHookItem,
	clickTreeItem,
	getHooks,
	gotoTest,
} from "../../pw-utils.ts";

test("Show multiple hook names at the same time", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-multiple");

	await clickTreeItem(devtools, "App");
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await clickHookItem(devtools, "useMemo");
	const hooks = await getHooks(devtools);
	expect(hooks).toEqual([
		["useState", "1"],
		["useState", "2"],
		["useState", "3"],
		["useCallback", "ƒ ()"],
		["useMemo", "6"],
	]);
});
