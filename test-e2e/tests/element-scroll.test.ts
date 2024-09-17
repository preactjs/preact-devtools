import { expect, test } from "@playwright/test";
import { gotoTest } from "../pw-utils.ts";

test("Clicking at the right of element names #144", async ({ page }) => {
	const { devtools } = await gotoTest(page, "deep-tree");

	await page.setViewportSize({
		width: 1280,
		height: 900,
	});

	const selector = '[data-name="App"]';
	await devtools.waitForSelector(selector);
	const { x, y } = await devtools.evaluate((s: string) => {
		const rect = document.querySelector(s)!.getBoundingClientRect();
		return { x: rect.right, y: rect.top };
	}, selector);
	const offset = await page.evaluate(() => {
		return document.querySelector("#devtools")!.getBoundingClientRect().top;
	});

	await page.mouse.click(x - 20, y + offset + 200);

	const text = await devtools.locator('[data-selected="true"]').textContent();
	expect(text).toEqual("ChildItemName");
});
