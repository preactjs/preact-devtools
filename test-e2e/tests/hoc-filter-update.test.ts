import { expect, test } from "@playwright/test";
import { getTreeItems, gotoTest, locateTreeItem } from "../pw-utils";

test("HOC-Component should work with updates", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc-update");

	await devtools.locator(locateTreeItem("Wrapped")).waitFor();

	await expect
		.poll(() => getTreeItems(devtools))
		.toEqual([
			{ name: "Wrapped", hocs: ["withBoof"] },
			{ name: "Bar", hocs: ["ForwardRef"] },
		]);

	// Trigger update
	await page.locator("button").click();

	await expect
		.poll(() => getTreeItems(devtools))
		.toEqual([
			{ name: "Wrapped", hocs: ["withBoof"] },
			{ name: "Foo", hocs: ["Memo"] },
		]);
});
