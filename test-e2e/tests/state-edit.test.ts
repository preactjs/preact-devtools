import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Mirror component state to the devtools", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator('[data-name="Display"]').click();
	await devtools.locator('[data-testid="props-row"] input').fill("42");
	await page.keyboard.press("Enter");

	const value = await devtools
		.locator('[data-testid="props-row"] input')
		.inputValue();
	expect(value).toEqual("42");

	await page.locator('[data-testid=result]:has-text("Counter: 42")').waitFor();
});
