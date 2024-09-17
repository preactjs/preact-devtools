import { expect, test } from "@playwright/test";
import { getTreeItems, gotoTest, locateTreeItem } from "../pw-utils.ts";

test("HOC-Component should work with updates", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc-update");

	await devtools.waitForSelector(locateTreeItem("Wrapped"));

	let items = await getTreeItems(devtools);
	expect(items).toEqual([
		{ name: "Wrapped", hocs: ["withBoof"] },
		{ name: "Bar", hocs: ["ForwardRef"] },
	]);

	// Trigger update
	await page.click("button");

	items = await getTreeItems(devtools);
	expect(items).toEqual([
		{ name: "Wrapped", hocs: ["withBoof"] },
		{ name: "Foo", hocs: ["Memo"] },
	]);
});
