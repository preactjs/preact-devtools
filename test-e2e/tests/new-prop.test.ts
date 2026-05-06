import { expect, test } from "@playwright/test";
import { getProps, gotoTest, locateTreeItem } from "../pw-utils";

test("Add new props", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator(locateTreeItem("Display")).click();

	await devtools.locator('[data-testid="props-row"]').first().waitFor();

	const propName = 'input[name="new-prop-name"]';
	const propValue = 'input[name="new-prop-value"]';
	await devtools.locator(propName).fill("foo");
	await devtools.locator(propValue).fill("42");
	await page.keyboard.press("Enter");

	await expect
		.poll(() => getProps(devtools))
		.toEqual({
			value: "0",
			foo: "42",
		});

	// New prop input should be cleared
	await expect(devtools.locator(propName)).toHaveValue("");
	await expect(devtools.locator(propValue)).toHaveValue("");
});
