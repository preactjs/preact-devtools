import {
	newTestPage,
	getSize,
	click,
	hasSelector,
	moveMouseAbs,
} from "../test-utils";
import { expect } from "chai";
import { waitForTestId } from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

export const description = "Highlighting should move with scroll";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "highlight-scroll");

	const inspect = '[data-testid="inspect-btn"]';
	await click(devtools, inspect);

	await page.hover('[data-testid="0"]');

	await waitForTestId(page, "highlight");

	const highlight = '[data-testid="highlight"]';
	const before = await getSize(page, highlight);
	await page.evaluate(() => {
		document.querySelector(".test-case")!.scrollBy(0, 1000);
	});
	await waitForPass(async () => {
		expect(await hasSelector(page, highlight)).to.equal(false);
	});

	await moveMouseAbs(page, 100, 100);
	await waitForPass(async () => {
		expect(await hasSelector(page, highlight)).to.equal(true);
	});

	const after = await getSize(page, highlight);
	expect(before.top).not.to.equal(after.top);
}
