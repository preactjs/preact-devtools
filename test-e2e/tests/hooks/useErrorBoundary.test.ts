import { clickAndWaitForHooks, newTestPage } from "../../test-utils";
import { expect } from "chai";
import { assertNotSelector, getText } from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

export const description = "Inspect useErrorBoundary hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	await clickAndWaitForHooks(devtools, "ErrorBoundary1");

	let name = await getText(devtools, '[data-testid="prop-name"]');
	let value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useErrorBoundary");
	expect(value).to.equal("");

	// Should not be collapsable
	await assertNotSelector(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await assertNotSelector(devtools, '[data-testid="prop-value"] input');

	// Error boundary with callback
	await clickAndWaitForHooks(devtools, "ErrorBoundary2");

	name = await getText(devtools, '[data-testid="prop-name"]');
	expect(name).to.equal("useErrorBoundary");

	await waitForPass(async () => {
		value = await getText(devtools, '[data-testid="prop-value"]');
		expect(value).to.equal("ƒ ()");
	});
}
