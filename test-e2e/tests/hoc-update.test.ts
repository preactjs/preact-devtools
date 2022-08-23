import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Test HOCs on update", async ({ page }) => {
	const { devtools } = await gotoTest(page, "static-subtree");

	await devtools
		.locator('[data-name="Static"] [data-testid="hoc-labels"]')
		.first()
		.waitFor();

	await page.locator("button").click();

	const txt = await page.locator("data-testid=result").textContent();
	expect(txt).toEqual("Counter: 1");

	const items = await devtools
		.locator("data-testid=hoc-labels")
		.allInnerTexts();
	expect(items).toEqual(["Memo", "Memo"]);
});
