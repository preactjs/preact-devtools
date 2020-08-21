import { expect } from "chai";
import { newTestPage, clickNestedText } from "../test-utils";
import { getText } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Display symbol values";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "symbols");

	await wait(200);

	// Hooks
	await clickNestedText(devtools, "SymbolComponent");
	await devtools.waitForSelector('[data-testid="Hooks"]');
	let text = await getText(devtools, '[data-testid="prop-value"]');
	expect(text).to.equal("Symbol(foobar)");

	// Props
	await clickNestedText(devtools, "Child");
	await devtools.waitForSelector('[data-testid="Props"]');
	text = await getText(devtools, '[data-testid="prop-value"]');
	expect(text).to.equal("Symbol(foobar)");

	// State
	await clickNestedText(devtools, "ClassComponent");
	await devtools.waitForSelector('[data-testid="State"]');
	text = await getText(devtools, '[data-testid="prop-value"]');
	expect(text).to.equal("Symbol(foobar)");
}
