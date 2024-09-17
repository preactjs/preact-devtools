import { expect, test } from "@playwright/test";
import { getProps, gotoTest, locateTreeItem } from "../pw-utils.ts";

test("Test keyboard navigation in elements tree", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator(locateTreeItem("Counter")).click();
	expect(Object.keys(await getProps(devtools))).toEqual([]);

	await page.keyboard.press("ArrowDown");
	let selected = await devtools.locator('[data-selected="true"]').textContent();

	const prop = '[data-testid="Props"] [data-testid="props-row"]';

	expect(selected).toEqual("Display");
	expect((await devtools.$$(prop)).length).toEqual(1);

	await page.keyboard.press("ArrowUp");
	selected = await devtools.locator('[data-selected="true"]').textContent();

	expect(selected).toEqual("Counter");
	expect((await devtools.$$(prop)).length).toEqual(0);
});
