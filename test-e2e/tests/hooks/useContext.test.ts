import { test, expect } from "@playwright/test";
import {
	getHooks,
	gotoTest,
	locateTreeItem,
	waitForPass,
} from "../../pw-utils";

test("Inspect useContext hook", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks");

	await devtools.locator(locateTreeItem("ContextComponent")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	const hooks = await getHooks(devtools);
	expect(hooks).toEqual([["useContext", '"foobar"']]);

	// Should not be collapsable
	await expect(
		devtools.locator('[data-testid="props-row"] > button'),
	).toHaveCount(0);

	// Should not be editable
	await expect(
		devtools.locator('[data-testid="props-value"] > input'),
	).toHaveCount(0);

	// Check if default value is read when no Provider is present
	await devtools.locator(locateTreeItem("ContextNoProvider")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await waitForPass(async () => {
		const hooks = await getHooks(devtools);
		expect(hooks).toEqual([["useContext", "0"]]);
	});
});
