import { newTestPage, click, getText } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";

export const description = "Don't trigger events on click during inspection";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	const target = '[data-testid="result"]';
	expect(await getText(page, target)).to.equal("Counter: 0");

	const inspect = '[data-testid="inspect-btn"]';
	await click(devtools, inspect);

	await page.click("button");

	const text = await getText(page, target);
	expect(text).to.equal("Counter: 0");

	await closePage(page);
}
