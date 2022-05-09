import {
	newTestPage,
	click,
	clickTab,
	waitForSelector,
} from "../../test-utils";
import { wait } from "pentf/utils";
import { assertNotSelector } from "pentf/browser_utils";

export const description = "Don't crash on measuring text nodes";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "highlight-text");
	await waitForSelector(page, "button");

	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testId="toggle-highlight-updates"]');

	await click(page, "button");

	// Run twice to check if canvas is re-created
	const id = "#preact-devtools-highlight-updates";
	await waitForSelector(page, id);

	await wait(1000);
	await assertNotSelector(page, id);
}
