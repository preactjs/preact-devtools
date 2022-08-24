import { test, expect } from "@playwright/test";
import { gotoTest, waitForPass } from "../pw-utils";

test("Inspect should select node in elements panel", async ({ page }) => {
	const { devtools } = await gotoTest(page, "root-multi");

	await waitForPass(async () => {
		const btns = await page.locator("button").count();
		expect(btns).toEqual(2);
	});

	const txts = await devtools.locator("data-testid=tree-item").allInnerTexts();
	expect(txts).toEqual(["Counter", "Display", "Counter", "Display"]);
});
