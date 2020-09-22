import { newTestPage } from "../../test-utils";
import { expect } from "chai";
import {
	assertNotSelector,
	clickNestedText,
	getText,
} from "pentf/browser_utils";

export const description = "Inspect useCallback hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	const hooksPanel = '[data-testid="props-row"]';

	// State update
	await clickNestedText(devtools, "CallbackOnly");
	await devtools.waitForSelector(hooksPanel);

	const name = await getText(devtools, '[data-testid="prop-name"]');
	const value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useCallback");
	expect(value).to.equal("ƒ ()");

	// Should not be collapsable
	await assertNotSelector(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await assertNotSelector(devtools, '[data-testid="prop-value"] input');
}
