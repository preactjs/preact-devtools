import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Don't trigger events on click during inspection", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await expect(page.locator('[data-testid="result"]')).toHaveText("Counter: 0");

	await devtools.locator('[data-testid="inspect-btn"]').click();
	await page.locator("button").click();

	await expect(page.locator('[data-testid="result"]')).toHaveText("Counter: 0");
});
