import { expect, test } from "@playwright/test";
import { getProps, gotoTest, locateTreeItem } from "../pw-utils.ts";

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
