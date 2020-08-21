import { newTestPage, getSize, click, hasSelector } from "../test-utils";
import { expect } from "chai";
import { waitForTestId } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Highlighting should move with scroll";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "highlight-scroll");

	const inspect = '[data-testid="inspect-btn"]';
	await click(devtools, inspect);

	await page.hover('[data-testid="0"]');

	await waitForTestId(page, "highlight", { timeout: 2000 });

	const highlight = '[data-testid="highlight"]';
	const before = await getSize(page, highlight);
	await page.evaluate(() => {
		document.querySelector(".test-case")!.scrollBy(0, 1000);
	});
	await wait(1000);
	expect(await hasSelector(page, highlight)).to.equal(false);

	await page.mouse.move(10, 10);
	expect(await hasSelector(page, highlight)).to.equal(true);

	const after = await getSize(page, highlight);
	expect(before.top).not.to.equal(after.top);
}
