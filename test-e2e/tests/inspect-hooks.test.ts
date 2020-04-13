import { newTestPage, click, getText } from "../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pintf/browser_utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hooks", {
		preact: "hook",
	});

	const hooksPanel = '[data-testid="hooks-panel"]';

	// State update
	await clickText(devtools, "Counter", { elementXPath: "//*" });
	await devtools.waitForSelector(hooksPanel, { timeout: 2000 });

	await click(devtools, hooksPanel + " input");
	await page.keyboard.press("ArrowUp");
	await page.keyboard.press("Enter");

	const text = await getText(page, '[data-testid="result"]');
	expect(text).to.equal("Counter: 1");
	// await closePage(page);
}
