import { expect, test } from "@playwright/test";
import { getProps, gotoTest, locateTreeItem, wait } from "../pw-utils";

test("Add new props", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.click(locateTreeItem("Display"));

	await devtools.waitForSelector('[data-testid="props-row"]');

	const propName = 'input[name="new-prop-name"]';
	const propValue = 'input[name="new-prop-value"]';
	await devtools.fill(propName, "foo");
	await devtools.fill(propValue, "42");
	await page.keyboard.press("Enter");

	await wait(500);

	const props = await getProps(devtools);
	expect(props).toEqual({
		value: "0",
		foo: "42",
	});

	// New prop input should be cleared
	expect(await devtools.locator(propName).getAttribute("value")).toEqual(null);
	expect(await devtools.locator(propValue).getAttribute("value")).toEqual(null);
});
