import { newTestPage, getText, checkNotPresent } from "../../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pintf/browser_utils";

export const description = "Inspect useLayoutEffect hook";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hooks", {
		preact: "hook",
	});

	const hooksPanel = '[data-testid="props-row"]';

	// State update
	await clickText(devtools, "LayoutEffect", {
		elementXPath: "//*",
		timeout: 2000,
	});
	await devtools.waitForSelector(hooksPanel, { timeout: 2000 });

	const name = await getText(devtools, '[data-testid="prop-name"]');
	const value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useLayoutEffect");
	expect(value).to.equal("anonymous()");

	// Should not be collapsable
	await checkNotPresent(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await checkNotPresent(devtools, '[data-testid="prop-value"] input');

	await closePage(page);
}
