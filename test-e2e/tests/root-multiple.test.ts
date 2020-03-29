import { newTestPage, click, getLog, getText } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pintf/browser_utils";
import { wait } from "pintf/utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "root-multi");

	const buttons = await page.$$("button");
	expect(buttons.length).to.equal(2);

	const item = '[data-testid="tree-item"]';
	const items = await devtools.$$(item);

	const texts = await Promise.all(
		items.map((_, i) => getText(devtools, `${item}:nth-child(${i + 1})`)),
	);
	expect(texts).to.deep.equal(["Counter", "Display", "Counter", "Display"]);

	await closePage(page);
}
