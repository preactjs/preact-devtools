import { newTestPage, installMouseHelper, clickTreeItem } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";

export const description =
	"Don't scroll a virtualized element if already visible";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "deep-tree-2");
	await installMouseHelper(devtools);

	const selector = '[data-name="App"]';
	await devtools.waitForSelector(selector);

	await clickTreeItem(devtools, "Bar");

	await wait(2000);

	const scroll = await devtools.evaluate(() => {
		return Number(document.querySelector('[data-tree="true"]')?.scrollTop);
	});

	expect(scroll).to.equal(0);
}
