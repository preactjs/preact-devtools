import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Inspect should select node in elements panel", async ({ page }) => {
	const { devtools } = await gotoTest(page, "context-displayName");

	await expect(devtools.locator('[data-testid="tree-item"]')).toHaveText([
		"App",
		"Foobar.Provider",
		"Foobar.Consumer",
	]);
});
