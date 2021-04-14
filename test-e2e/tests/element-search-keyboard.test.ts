import { newTestPage } from "../test-utils";
import { waitFor } from "pentf/assert_utils";
import { waitForSelector } from "pentf/browser_utils";

export const description =
	"Pressing Enter should scroll marked results into view during search #162";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "deep-tree");

	await waitForSelector(devtools, '[data-name="App"]');
	await devtools.type('[data-testid="element-search"]', "Child");

	// Press Enter a bunch of times
	for (let i = 0; i < 24; i++) {
		await page.keyboard.press("Enter");
	}

	await waitFor(async () => {
		const marked = await devtools.$("[data-marked]");
		if (!marked) return false;
		return await marked!.isIntersectingViewport();
	});
}
