import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils.ts";

test("HOC-Component labels should be searchable", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc");

	await devtools.waitForSelector(locateTreeItem("Foo"));
	await devtools.type('[data-testid="element-search"]', "forw");

	let marked = await devtools.$$("mark");
	expect(marked.length).toEqual(2);
	expect(
		await marked[0].evaluate((el) => el.hasAttribute("data-marked")),
	).toEqual(true);

	await devtools
		.locator('[data-testid="search-counter"]:has-text("1 | 2")')
		.waitFor();

	await page.keyboard.press("Enter");

	marked = await devtools.$$("mark");
	expect(marked.length).toEqual(2);
	expect(
		await marked[1].evaluate((el) => el.hasAttribute("data-marked")),
	).toEqual(true);
});
