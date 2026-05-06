import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Test HOCs on update", async ({ page }) => {
	const { devtools } = await gotoTest(page, "static-subtree");

	await devtools
		.locator('[data-name="Static"] [data-testid="hoc-labels"]')
		.first()
		.waitFor();

	await page.locator("button").click();

	await expect(page.locator("data-testid=result")).toHaveText("Counter: 1");

	await expect(devtools.locator("data-testid=hoc-labels")).toHaveText([
		"Memo",
		"Memo",
	]);
});
