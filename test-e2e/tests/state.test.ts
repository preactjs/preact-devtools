import { expect, test } from "@playwright/test";
import { gotoTest } from "../pw-utils.ts";

test("Mirror component state to the devtools", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator('[data-name="Display"]').click();

	const input = '[data-testid="props-row"] input';
	const result = '[data-testid="result"]';

	let value = await devtools.locator(input).inputValue();
	let text = await page.locator(result).textContent();
	expect(value).toEqual("0");
	expect(text).toEqual("Counter: 0");

	await page.click("button");

	value = await devtools.locator(input).inputValue();
	text = await page.locator(result).textContent();
	expect(value).toEqual("1");
	expect(text).toEqual("Counter: 1");
});
