import { test, expect } from "@playwright/test";
import { gotoTest, wait } from "../pw-utils";

test("Scroll a virtualized element into view #333", async ({ page }) => {
	const { devtools } = await gotoTest(page, "deep-tree-2");

	const selector = '[data-name="App"]';
	await devtools.waitForSelector(selector);

	await devtools.click('[data-testid="inspect-btn"]');

	await page.evaluate(() => {
		const target = document.querySelector("#select-me") as HTMLHeadingElement;
		target.scrollIntoView();
	});

	await wait(1000);
	await page.hover("#select-me");

	await page.waitForSelector('[data-testid="highlight"]');
	await wait(2000);
	await page.waitForSelector('[data-testid="select-me"]');
	await wait(1000);

	const text = await devtools.locator('[data-selected="true"]').textContent();
	expect(text).toEqual("Foo");
});
