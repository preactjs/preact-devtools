import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";
import assert from "assert";

test("Highlighting should move with scroll", async ({ page }) => {
	const { devtools } = await gotoTest(page, "highlight-scroll");

	const inspect = '[data-testid="inspect-btn"]';
	await devtools.click(inspect);

	await page.hover('[data-testid="0"]');

	const size = await page.locator('[data-testid="0"]').boundingBox();
	assert(size);

	const highlight = '[data-testid="highlight"]';
	await page.waitForSelector(highlight);

	const before = await page.$eval(highlight, el => el.getBoundingClientRect());
	await page.evaluate(() => {
		document.querySelector(".test-case")!.scrollBy(0, 1000);
	});

	await expect(page.locator(highlight)).toHaveCount(0);

	const _x = size.x + size.width / 2;
	const _y = size.y + size.height / 2;
	await page.pause();
	await page.mouse.move(_x - 100, _y - 100);
	await expect(page.locator(highlight)).toHaveCount(1);

	const after = await page.$eval(highlight, el => el.getBoundingClientRect());
	expect(before.top).not.toEqual(after.top);
});
