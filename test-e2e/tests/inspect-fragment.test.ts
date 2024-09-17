import { expect, test } from "@playwright/test";
import { gotoTest } from "../pw-utils.ts";

test("Highlighting combined DOM tree of a Fragment", async ({ page }) => {
	const { devtools } = await gotoTest(page, "highlight-fragment");

	// 1st test
	let size = await page.locator("data-testid=test1").boundingBox();

	await devtools.locator("data-testid=tree-item").first().click();
	await page.locator("data-testid=highlight").waitFor();

	let highlight = await page.locator("data-testid=highlight").boundingBox();
	expect(size!.width).toEqual(highlight!.width);
	expect(size!.height).toEqual(highlight!.height);

	// 2nd test
	size = await page.locator("data-testid=test2").boundingBox();
	await devtools.locator("data-testid=tree-item").nth(1).click();

	highlight = await page.locator("data-testid=highlight").boundingBox();
	expect(size!.width).toEqual(highlight!.width);
	expect(size!.height).toEqual(highlight!.height);
});
