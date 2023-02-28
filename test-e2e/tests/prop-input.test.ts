import { expect, Frame, Page, test } from "@playwright/test";
import { getLog, gotoTest, locateTreeItem, wait } from "../pw-utils";

test("Input various data types into DataInput", async ({ page }) => {
	const { devtools } = await gotoTest(page, "data-input");

	await devtools.click(locateTreeItem("Display"));
	await devtools.waitForSelector('[data-testid="props-row"]');

	const input = 'input[name="root.value"]';
	let data = await enterText(page, devtools, input, '"foo"');
	expect(data).toEqual({
		value: '"foo"',
		rendered: "foo",
		type: "string",
	});

	data = await enterText(page, devtools, input, '""');
	expect(data).toEqual({
		value: '""',
		rendered: "",
		type: "string",
	});

	// null
	data = await enterText(page, devtools, input, "null");
	expect(data).toEqual({
		value: "null",
		rendered: null,
		type: "non-editable",
	});

	// boolean
	data = await enterText(page, devtools, input, "true");
	expect(data).toEqual({
		value: "true",
		rendered: true,
		type: "boolean",
	});

	data = await enterText(page, devtools, input, "false");
	expect(data).toEqual({
		value: "false",
		rendered: false,
		type: "boolean",
	});

	// number
	data = await enterText(page, devtools, input, "42");
	expect(data).toEqual({
		value: "42",
		rendered: 42,
		type: "number",
	});

	data = await enterText(page, devtools, input, "0");
	expect(data).toEqual({
		value: "0",
		rendered: 0,
		type: "number",
	});

	data = await enterText(page, devtools, input, "-1");
	expect(data).toEqual({
		value: "-1",
		rendered: -1,
		type: "number",
	});

	// Array
	data = await enterText(page, devtools, input, "[1, 2]");
	expect(data).toEqual({
		value: "[1, 2]",
		rendered: [1, 2],
		type: "non-editable",
	});

	data = await enterText(page, devtools, input, '[1, null, true, "foo"]');
	expect(data).toEqual({
		value: '[1, null, true, "foo"]',
		rendered: [1, null, true, "foo"],
		type: "non-editable",
	});

	// Object
	data = await enterText(page, devtools, input, "{}");
	expect(data).toEqual({
		value: "{}",
		rendered: {},
		type: "non-editable",
	});

	data = await enterText(page, devtools, input, '{"foo":123, "bar": [1,2]}');
	expect(data).toEqual({
		value: "{bar: [1, 2], foo: 123}",
		rendered: { foo: 123, bar: [1, 2] },
		type: "non-editable",
	});

	// undefined
	data = await enterText(page, devtools, input, "");
	expect(data).toEqual({
		value: "undefined",
		rendered: undefined,
		type: "non-editable",
	});

	data = await enterText(page, devtools, input, "undefined");
	expect(data).toEqual({
		value: "undefined",
		rendered: undefined,
		type: "non-editable",
	});
});

async function getParsed(page: Page): Promise<any> {
	const log = await getLog(page);
	for (let i = log.length - 1; i >= 0; i--) {
		if (log[i].type === "update-prop") {
			return log[i].data.value;
		}
	}

	throw new Error("No update-prop event found");
}

async function enterText(
	page: Page,
	devtools: Frame,
	selector: string,
	text: string,
) {
	await page.click("button");
	await devtools.click(locateTreeItem("Display"));
	await expect(devtools.locator('[data-testid="undo-btn"]')).toHaveCount(0);

	await devtools.waitForSelector(selector);
	await devtools.fill(selector, text);
	await page.keyboard.press("Enter");

	await page.click('[data-testid="result"]');

	await wait(200);

	const rendered = await getParsed(page);

	const present = await devtools.$(selector);
	const type = present
		? await devtools.locator(selector).getAttribute("data-type")
		: "non-editable";
	const value = present
		? await devtools.$eval(selector, el => (el as any).value)
		: await devtools.locator('[data-testid="prop-value"]').textContent();
	return { rendered, type, value };
}
