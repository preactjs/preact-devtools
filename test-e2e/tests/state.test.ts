import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Mirror component state to the devtools", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator('[data-name="Display"]').click();

	const input = '[data-testid="props-row"] input';
	const result = '[data-testid="result"]';

	await expect(devtools.locator(input)).toHaveValue("0");
	await expect(page.locator(result)).toHaveText("Counter: 0");

	await page.click("button");

	await expect(devtools.locator(input)).toHaveValue("1");
	await expect(page.locator(result)).toHaveText("Counter: 1");
});
