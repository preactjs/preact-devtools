import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Test HOCs on forwardRef update", async ({ page }) => {
	const { devtools } = await gotoTest(page, "forwardRef-update");

	await devtools.locator('[data-name="Foo"]').click();
	let labels = devtools.locator('[data-name="Foo"] [data-testid="hoc-labels"]');
	await expect(labels).toHaveCount(0);

	await page.locator("button").click();

	await page.locator('[data-testid="result"]:has-text("Counter: 1")');

	await devtools.locator('[data-name="Foo"]').click();

	labels = devtools.locator('[data-name="Foo"] [data-testid="hoc-labels"]');
	await expect(labels).toHaveCount(0);
});
