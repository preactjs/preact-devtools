import { test, expect } from "@playwright/test";
import { gotoTest, locateTreeItem, getProps } from "../pw-utils";

test("Inspect should sort object keys", async ({ page }) => {
	const { devtools } = await gotoTest(page, "props");

	await devtools.locator(locateTreeItem("NestedObjProps")).click();
	await devtools.locator('[data-testid="Props"]').waitFor();
	await devtools.locator('[data-testid="props-row"]').first().waitFor();

	await expect
		.poll(() => getProps(devtools))
		.toEqual({
			a: "1",
			b: "{a: 1, b: 2, c: 3}",
			c: "3",
		});
});
