import { test, expect } from "@playwright/test";
import { getHooks, gotoTest, locateTreeItem } from "../../pw-utils";

test("Inspect useLayoutEffect hook", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks");

	await devtools.locator(locateTreeItem("LayoutEffect")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	const hooks = await getHooks(devtools);
	expect(hooks).toEqual([["useLayoutEffect", "ƒ ()"]]);

	// Should not be collapsable
	await expect(
		devtools.locator('[data-testid="props-row"] > button'),
	).toHaveCount(0);

	// Should not be editable
	await expect(
		devtools.locator('[data-testid="props-value"] > input'),
	).toHaveCount(0);
});
