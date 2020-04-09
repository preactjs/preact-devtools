import { newTestPage, typeText } from "../test-utils";
import { clickText, closePage, waitForText } from "pintf/browser_utils";
import { Page } from "puppeteer";

async function type(page: Page, devtools: Page, value: string | number) {
	const input = '[data-testid="prop-value"] input';
	await devtools.waitForSelector(input);

	await typeText(devtools, input, String(value));
	await page.keyboard.press("Enter");
}

export const description =
	"Create a copy when doing props/state/context updates";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "update-all");

	// Props
	await clickText(devtools, "Props", { elementXPath: "//*" });
	await type(page, devtools, "1");
	await waitForText(page, "props: 1, true", { timeout: 1000 });

	// State
	await clickText(devtools, "State", { elementXPath: "//*" });
	await type(page, devtools, "1");
	await waitForText(page, "state: 1, true", { timeout: 1000 });

	// Legacy Context
	await clickText(devtools, "LegacyConsumer", { elementXPath: "//*" });
	await type(page, devtools, "1");
	await waitForText(page, "legacy context: 1, true", { timeout: 1000 });

	await closePage(page);
}
