import { newTestPage, click, clickAndWaitForHooks } from "../../test-utils";
import { expect } from "chai";
import { getText } from "pentf/browser_utils";

export const description = "Show custom debug value";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hooks");

	// State update
	await clickAndWaitForHooks(devtools, "DebugValue");

	const name = await getText(devtools, '[data-testid="prop-name"]');
	let value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useMyHook");
	expect(value).to.equal('"Offline"');

	await click(page, '[data-testid="debug-hook-toggle"]');

	value = await getText(devtools, '[data-testid="prop-value"]');
	expect(value).to.equal('"Online"');
}
