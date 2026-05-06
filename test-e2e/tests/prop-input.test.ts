import { expect, Frame, Page, test } from "@playwright/test";
import { getLog, gotoTest, locateTreeItem } from "../pw-utils";

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

async function getParsedAfter(page: Page, sinceIndex: number): Promise<any> {
	let value: any;
	await expect
		.poll(async () => {
			const log = await getLog(page);
			for (let i = log.length - 1; i >= sinceIndex; i--) {
				if (log[i].type === "update-prop") {
					value = log[i].data.value;
					return true;
				}
			}
			return false;
		})
		.toBe(true);
	return value;
}

async function enterText(
	page: Page,
	devtools: Frame,
	selector: string,
	text: string,
) {
	await page.locator("button").click();
	await devtools.locator(locateTreeItem("Display")).click();
	await expect(devtools.locator('[data-testid="undo-btn"]')).toHaveCount(0);

	await devtools.locator(selector).waitFor();
	const logLengthBefore = (await getLog(page)).length;
	await devtools.locator(selector).fill(text);
	await page.keyboard.press("Enter");

	await page.locator('[data-testid="result"]').click();

	const rendered = await getParsedAfter(page, logLengthBefore);

	const present = (await devtools.locator(selector).count()) > 0;
	const type = present
		? await devtools.locator(selector).getAttribute("data-type")
		: "non-editable";
	const value = present
		? await devtools.locator(selector).inputValue()
		: await devtools.locator('[data-testid="prop-value"]').textContent();
	return { rendered, type, value };
}
