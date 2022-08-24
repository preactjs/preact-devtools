import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Don't trigger events on click during inspection", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	let txt = await page.locator('[data-testid="result"]').textContent();

	await devtools.locator('[data-testid="inspect-btn"]').click();
	await page.locator("button").click();

	txt = await page.locator('[data-testid="result"]').textContent();
	expect(txt).toEqual("Counter: 0");
});
