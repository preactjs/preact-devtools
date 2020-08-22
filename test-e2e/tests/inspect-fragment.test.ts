import { newTestPage, getSize } from "../test-utils";
import { expect } from "chai";
import { waitForTestId } from "pentf/browser_utils";

export const description = "Highlighting combined DOM tree of a Fragment";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "highlight-fragment");

	// 1st test
	let size = await getSize(page, '[data-testid="test1"]');
	await devtools.waitForSelector('[data-testid="tree-item"]');

	const items = await devtools.$$('[data-testid="tree-item"]');
	await items[0]!.click();
	await waitForTestId(page, "highlight");

	let highlight = await getSize(page, '[data-testid="highlight"]');
	expect(size.width).to.equal(highlight.width);
	expect(size.height).to.equal(highlight.height);

	// 2nd test
	size = await getSize(page, '[data-testid="test2"]');
	await items[1]!.click();
	await waitForTestId(page, "highlight");

	highlight = await getSize(page, '[data-testid="highlight"]');
	expect(size.width).to.equal(highlight.width);
	expect(size.height).to.equal(highlight.height);
}
