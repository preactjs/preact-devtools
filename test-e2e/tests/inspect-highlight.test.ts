import { newTestPage, getText, getSize } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pintf/browser_utils";
import { wait } from "pintf/utils";

export const description = "Highlighting nested elements affects overlay size";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	const target = '[data-testid="result"]';
	expect(await getText(page, target)).to.equal("Counter: 0");

	const inspect = '[data-testid="inspect-btn"]';
	await devtools.click(inspect);

	const highlight = '[data-testid="highlight"]';
	await page.hover(target);
	await wait(500);
	const sizeTarget = await getSize(page, highlight);

	await page.hover("button");
	await wait(500);
	const sizeBtn = await getSize(page, highlight);

	expect(sizeTarget).not.to.deep.equal(sizeBtn);

	await closePage(page);
}
