import { clickAndWaitForHooks, newTestPage } from "../../test-utils";
import { expect } from "chai";
import { assertNotSelector, getText } from "pentf/browser_utils";

export const description = "Inspect useMemo hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	// State update
	await clickAndWaitForHooks(devtools, "Memo");

	const name = await getText(devtools, '[data-testid="prop-name"]');
	const value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useMemo");
	expect(value).to.equal("0");

	// Should not be collapsable
	await assertNotSelector(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await assertNotSelector(devtools, '[data-testid="prop-value"] input');
}
