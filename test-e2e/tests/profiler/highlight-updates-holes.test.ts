import {
	newTestPage,
	click,
	clickTab,
	waitForSelector,
} from "../../test-utils";
import { expect } from "chai";
import { clickSelector } from "pentf/browser_utils";

export const description = "Check if highlight updates is rendered";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "holes");
	await waitForSelector(page, "button");

	await clickTab(devtools, "SETTINGS");
	await click(devtools, '[data-testId="toggle-highlight-updates"]');

	const errors: string[] = [];
	page.on("pageerror", err => errors.push(err.toString()));

	await clickSelector(page, "button");
	await clickSelector(page, "button");

	expect(errors).to.deep.equal([]);
}
