import {
	newTestPage,
	click,
	clickTab,
	typeText,
	checkNotPresent,
} from "../../test-utils";
import { closePage } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Check if highlight updates is rendered";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "todo");
	await page.waitForSelector("button");

	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testId="toggle-highlight-updates"]');

	// Run twice to check if canvas is re-created
	for (let i = 0; i < 2; i++) {
		await typeText(page, "input", "foo");
		await page.keyboard.press("Enter");

		const id = "#preact-devtools-highlight-updates";
		await page.waitForSelector(id);

		await wait(1000);
		await checkNotPresent(page, id);
	}

	await closePage(page);
}
