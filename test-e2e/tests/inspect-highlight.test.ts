import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Highlighting nested elements affects overlay size", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await page.locator('[data-testid="result"]:has-text("Counter: 0")').waitFor();

	await devtools.click('[data-testid="inspect-btn"]');

	const highlight = '[data-testid="highlight"]';
	await page.hover('[data-testid="result"]');

	const sizeTarget = await page.locator(highlight).boundingBox();

	await page.hover("button");
	const sizeBtn = await page.locator(highlight).boundingBox();

	expect(sizeTarget).not.toEqual(sizeBtn);
});
