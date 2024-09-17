import { expect, test } from "@playwright/test";
import { getHooks, gotoTest, locateTreeItem } from "../../pw-utils.ts";

test("Inspect useErrorBoundary hook", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks");

	await devtools.locator(locateTreeItem("ErrorBoundary1")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	let hooks = await getHooks(devtools);
	expect(hooks).toEqual([["useErrorBoundary", ""]]);

	// Should not be collapsable
	await expect(
		devtools.locator('[data-testid="props-row"] > button'),
	).toHaveCount(0);

	// Should not be editable
	await expect(
		devtools.locator('[data-testid="props-value"] > input'),
	).toHaveCount(0);

	// Error boundary with callback
	await devtools.locator(locateTreeItem("ErrorBoundary2")).click();
	hooks = await getHooks(devtools);
	expect(hooks).toEqual([["useErrorBoundary", "ƒ ()"]]);
});
