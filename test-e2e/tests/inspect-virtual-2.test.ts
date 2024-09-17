import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem, wait } from "../pw-utils.ts";

test("Don't scroll a virtualized element if already visible", async ({ page }) => {
	const { devtools } = await gotoTest(page, "deep-tree-2");

	await devtools.click(locateTreeItem("Bar"));

	await wait(1000);

	const scroll = await devtools.evaluate(() => {
		return Number(document.querySelector('[data-tree="true"]')?.scrollTop);
	});

	expect(scroll).toEqual(0);
});
