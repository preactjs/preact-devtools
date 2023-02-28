import { test, expect } from "@playwright/test";
import { gotoTest, locateTreeItem, getProps } from "../pw-utils";

test("Inspect should sort object keys", async ({ page }) => {
	const { devtools } = await gotoTest(page, "props");

	await devtools.click(locateTreeItem("NestedObjProps"));
	await devtools.waitForSelector('[data-testid="Props"]');

	await devtools.waitForSelector('[data-testid="props-row"]');

	const props = await getProps(devtools);
	expect(props).toEqual({
		a: "1",
		b: "{a: 1, b: 2, c: 3}",
		c: "3",
	});
});
