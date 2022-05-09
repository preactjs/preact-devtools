import { expect } from "chai";
import { newTestPage, waitForSelector } from "../test-utils";
import { clickNestedText, getText } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Display symbol values";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "symbols");

	await wait(200);

	// Hooks
	await clickNestedText(devtools, "SymbolComponent");
	await waitForSelector(devtools, '[data-testid="Hooks"]');
	let text = await getText(devtools, '[data-testid="prop-value"]');
	expect(text).to.equal("Symbol(foobar)");

	// Props
	await clickNestedText(devtools, "Child");
	await waitForSelector(devtools, '[data-testid="Props"]');
	text = await getText(devtools, '[data-testid="prop-value"]');
	expect(text).to.equal("Symbol(foobar)");

	// State
	await clickNestedText(devtools, "ClassComponent");
	await waitForSelector(devtools, '[data-testid="State"]');
	text = await getText(devtools, '[data-testid="prop-value"]');
	expect(text).to.equal("Symbol(foobar)");
}
