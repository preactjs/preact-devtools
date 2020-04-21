import { newTestPage, getAttribute, getText, click } from "../test-utils";
import { expect } from "chai";
import { clickText, closePage } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Mirror component state to the devtools";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	await clickText(devtools, "Display", { elementXPath: "//*" });

	const input = '[data-testid="props-row"] input';
	const result = '[data-testid="result"]';

	let value = await getAttribute(devtools, input, "value");
	let text = await getText(page, result);
	expect(value).to.equal("0");
	expect(text).to.equal("Counter: 0");

	await click(page, "button");

	// Takes a bit until the message is passed to the iframe
	await wait(100);

	value = await getAttribute(devtools, input, "value");
	text = await getText(page, result);
	expect(value).to.equal("1");
	expect(text).to.equal("Counter: 1");

	await closePage(page);
}
