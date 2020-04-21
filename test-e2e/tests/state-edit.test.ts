import { newTestPage, getAttribute, getText, typeText } from "../test-utils";
import { expect } from "chai";
import { clickText, closePage } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Mirror component state to the devtools";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	await clickText(devtools, "Display", { elementXPath: "//*" });

	// Wait until inspection result is ready
	await wait(100);

	const input = '[data-testid="props-row"] input';
	await typeText(devtools, input, "42");
	await page.keyboard.press("Enter");

	const value = await getAttribute(devtools, input, "value");
	const text = await getText(page, '[data-testid="result"]');

	expect(value).to.equal("42");
	expect(text).to.equal("Counter: 42");

	await closePage(page);
}
