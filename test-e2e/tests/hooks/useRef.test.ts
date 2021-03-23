import { clickAndWaitForHooks, newTestPage } from "../../test-utils";
import { expect } from "chai";
import { assertNotSelector, getText } from "pentf/browser_utils";

export const description = "Inspect useRef hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	// State update
	await clickAndWaitForHooks(devtools, "RefComponent");

	const name = await getText(devtools, '[data-testid="prop-name"]');
	const value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useRef");
	expect(value).to.equal("0");

	// Should not be collapsable
	await assertNotSelector(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await assertNotSelector(devtools, '[data-testid="prop-value"] input');
}
