import {
	newTestPage,
	typeText,
	clickNestedText,
	getText$$,
} from "../test-utils";
import { expect } from "chai";
import { getAttribute } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Add new props";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	await clickNestedText(devtools, "Display");

	await devtools.waitForSelector('[data-testid="props-row"]');

	const propName = 'input[name="new-prop-name"]';
	const propValue = 'input[name="new-prop-value"]';
	await typeText(devtools, propName, "foo");
	await typeText(devtools, propValue, "42");
	await page.keyboard.press("Enter");

	await wait(500);

	const text = await getText$$(devtools, '[data-testid="props-row"]');
	const valueFoo = await getAttribute(
		devtools,
		'input[name="root.foo"]',
		"value",
	);
	expect(text).to.deep.equal(["value", "foo"]);
	expect(valueFoo).to.equal("42");

	// New prop input should be cleared
	expect(await getAttribute(devtools, propName, "value")).to.equal("");
	expect(await getAttribute(devtools, propValue, "value")).to.equal("");
}
