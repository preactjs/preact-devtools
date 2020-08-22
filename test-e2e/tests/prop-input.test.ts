import { newTestPage, typeText, getLog, click, doesExist } from "../test-utils";
import { expect } from "chai";
import {
	assertNotTestId,
	clickNestedText,
	getAttribute,
	getText,
	waitForTestId,
} from "pentf/browser_utils";
import { wait } from "pentf/utils";
import { Page } from "puppeteer";

export const description = "Input various data types into DataInput";

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
	devtools: Page,
	selector: string,
	text: string,
) {
	await click(page, "button");
	await clickNestedText(devtools, "Display");
	await assertNotTestId(devtools, "undo-btn");

	await devtools.waitForSelector(selector, { timeout: 3000 });
	await typeText(devtools, selector, text);
	await page.keyboard.press("Enter");
	await clickNestedText(page, "Counter");

	await wait(50);

	const rendered = await getParsed(page);

	const present = await doesExist(devtools, selector);
	const type = present
		? await getAttribute(devtools, selector, "data-type")
		: "non-editable";
	const value = present
		? await getAttribute(devtools, selector, "value")
		: await getText(devtools, '[data-testid="prop-value"]');
	return { rendered, type, value };
}

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "data-input");

	await clickNestedText(devtools, "Display");
	await waitForTestId(devtools, "props-row", { timeout: 2000 });

	const input = 'input[name="root.value"]';
	let data = await enterText(page, devtools, input, '"foo"');
	expect(data).to.deep.equal({
		value: '"foo"',
		rendered: "foo",
		type: "string",
	});

	data = await enterText(page, devtools, input, '""');
	expect(data).to.deep.equal({
		value: '""',
		rendered: "",
		type: "string",
	});

	// null
	data = await enterText(page, devtools, input, "null");
	expect(data).to.deep.equal({
		value: "null",
		rendered: null,
		type: "non-editable",
	});

	// boolean
	data = await enterText(page, devtools, input, "true");
	expect(data).to.deep.equal({
		value: "true",
		rendered: true,
		type: "boolean",
	});

	data = await enterText(page, devtools, input, "false");
	expect(data).to.deep.equal({
		value: "false",
		rendered: false,
		type: "boolean",
	});

	// number
	data = await enterText(page, devtools, input, "42");
	expect(data).to.deep.equal({
		value: "42",
		rendered: 42,
		type: "number",
	});

	data = await enterText(page, devtools, input, "0");
	expect(data).to.deep.equal({
		value: "0",
		rendered: 0,
		type: "number",
	});

	data = await enterText(page, devtools, input, "-1");
	expect(data).to.deep.equal({
		value: "-1",
		rendered: -1,
		type: "number",
	});

	// Array
	data = await enterText(page, devtools, input, "[1, 2]");
	expect(data).to.deep.equal({
		value: "[1, 2]",
		rendered: [1, 2],
		type: "non-editable",
	});

	data = await enterText(page, devtools, input, '[1, null, true, "foo"]');
	expect(data).to.deep.equal({
		value: '[1, null, true, "foo"]',
		rendered: [1, null, true, "foo"],
		type: "non-editable",
	});

	// Object
	data = await enterText(page, devtools, input, "{}");
	expect(data).to.deep.equal({
		value: "{}",
		rendered: {},
		type: "non-editable",
	});

	data = await enterText(page, devtools, input, '{"foo":123, "bar": [1,2]}');
	expect(data).to.deep.equal({
		value: "{foo: 123, bar: [1, 2]}",
		rendered: { foo: 123, bar: [1, 2] },
		type: "non-editable",
	});

	// undefined
	data = await enterText(page, devtools, input, "");
	expect(data).to.deep.equal({
		value: "undefined",
		rendered: undefined,
		type: "non-editable",
	});

	data = await enterText(page, devtools, input, "undefined");
	expect(data).to.deep.equal({
		value: "undefined",
		rendered: undefined,
		type: "non-editable",
	});
}
