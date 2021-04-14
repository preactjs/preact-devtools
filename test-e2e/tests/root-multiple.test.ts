import { newTestPage } from "../test-utils";
import { expect } from "chai";
import { getText } from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "root-multi");

	await waitForPass(async () => {
		const buttons = await page.$$("button");
		expect(buttons.length).to.equal(2);
	});

	const item = '[data-testid="tree-item"]';
	const items = await devtools.$$(item);

	const texts = await Promise.all(
		items.map((_, i) => getText(devtools, `${item}:nth-child(${i + 1})`)),
	);
	expect(texts).to.deep.equal(["Counter", "Display", "Counter", "Display"]);
}
