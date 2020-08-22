import { newTestPage, checkNotPresent } from "../../test-utils";
import { expect } from "chai";
import { clickNestedText, getText } from "pentf/browser_utils";

export const description = "Inspect useLayoutEffect hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks", {
		preact: "hook",
	});

	const hooksPanel = '[data-testid="props-row"]';

	// State update
	await clickNestedText(devtools, "LayoutEffect");
	await devtools.waitForSelector(hooksPanel);

	const name = await getText(devtools, '[data-testid="prop-name"]');
	const value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useLayoutEffect");
	expect(value).to.equal("ƒ ()");

	// Should not be collapsable
	await checkNotPresent(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await checkNotPresent(devtools, '[data-testid="prop-value"] input');
}
