import { test, expect } from "@playwright/test";
import { getHooks, gotoTest, locateTreeItem } from "../../pw-utils";

test("Inspect useContext hook Preact 10.5.14 (goober)", async ({ page }) => {
	const { devtools } = await gotoTest(page, "goober");

	await devtools.locator(locateTreeItem("a")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await devtools
		.locator('[data-testid="Hooks"] [data-depth="1"] button')
		.click();
	await devtools.locator('[data-testid="Hooks"] [data-depth="2"]').click();

	const hooks = await getHooks(devtools);
	expect(hooks).toEqual([
		["useTheme", ""],
		["useContext", "undefined"],
	]);
});
