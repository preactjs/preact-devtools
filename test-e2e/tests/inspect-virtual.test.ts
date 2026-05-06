import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Scroll a virtualized element into view #333", async ({ page }) => {
	const { devtools } = await gotoTest(page, "deep-tree-2");

	const selector = '[data-name="App"]';
	await devtools.locator(selector).waitFor();

	await devtools.locator('[data-testid="inspect-btn"]').click();

	await page.evaluate(() => {
		const target = document.querySelector("#select-me") as HTMLHeadingElement;
		target.scrollIntoView();
	});

	await page.hover("#select-me");

	await page.locator('[data-testid="highlight"]').waitFor();
	await page.locator('[data-testid="select-me"]').waitFor();

	await expect(devtools.locator('[data-selected="true"]')).toHaveText("Foo");
});
