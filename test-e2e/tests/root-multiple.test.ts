import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Inspect should select node in elements panel", async ({ page }) => {
	const { devtools } = await gotoTest(page, "root-multi");

	await expect(page.locator("button")).toHaveCount(2);

	await expect(devtools.locator("data-testid=tree-item")).toHaveText([
		"Counter",
		"Display",
		"Counter",
		"Display",
	]);
});
