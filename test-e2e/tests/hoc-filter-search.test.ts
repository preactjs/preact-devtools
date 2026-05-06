import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("HOC-Component labels should be searchable", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc");

	await devtools.locator(locateTreeItem("Foo")).first().waitFor();
	await devtools.locator('[data-testid="element-search"]').fill("forw");

	const marks = devtools.locator("mark");
	await expect(marks).toHaveCount(2);
	await expect(marks.nth(0)).toHaveAttribute("data-marked", /.*/);

	await devtools
		.locator('[data-testid="search-counter"]:has-text("1 | 2")')
		.waitFor();

	await page.keyboard.press("Enter");

	await expect(marks).toHaveCount(2);
	await expect(marks.nth(1)).toHaveAttribute("data-marked", /.*/);
});
