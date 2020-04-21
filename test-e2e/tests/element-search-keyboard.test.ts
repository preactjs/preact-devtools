import { newTestPage } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";

export const description =
	"Pressing Enter should scroll marked results into view during search #162";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "deep-tree");

	await devtools.waitForSelector('[data-name="App"]');
	await devtools.type('[data-testid="element-search"]', "Child");

	// Press Enter a bunch of times
	for (let i = 0; i < 24; i++) {
		await page.keyboard.press("Enter");
	}

	const marked = await devtools.$("[data-marked]");
	expect(await marked!.isIntersectingViewport()).to.equal(true);

	await closePage(page);
}
