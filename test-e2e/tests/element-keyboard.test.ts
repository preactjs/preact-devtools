import { newTestPage, getText } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Test keyboard navigation in elements tree";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	const elem1 = '[data-testid="tree-item"][data-name="Counter"]';
	const prop = '[data-testid="props-row"]';

	await devtools.click(elem1);
	await wait(500);
	expect((await devtools.$$(prop)).length).to.equal(0);

	await page.keyboard.press("ArrowDown");
	await wait(500);
	let selected = await getText(devtools, '[data-selected="true"]');

	expect(selected).to.equal("Display");
	expect((await devtools.$$(prop)).length).to.equal(1);

	await page.keyboard.press("ArrowUp");
	await wait(500);
	selected = await getText(devtools, '[data-selected="true"]');

	expect(selected).to.equal("Counter");
	expect((await devtools.$$(prop)).length).to.equal(0);

	await closePage(page);
}
