import { newTestPage, checkNotPresent } from "../../test-utils";
import { expect } from "chai";
import { clickNestedText, getText } from "pentf/browser_utils";

export const description = "Inspect useErrorBoundary hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks", {
		preact: "hook",
	});

	const hooksPanel = '[data-testid="props-row"]';

	await clickNestedText(devtools, "ErrorBoundary1");
	await devtools.waitForSelector(hooksPanel);

	let name = await getText(devtools, '[data-testid="prop-name"]');
	let value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useErrorBoundary");
	expect(value).to.equal("");

	// Should not be collapsable
	await checkNotPresent(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await checkNotPresent(devtools, '[data-testid="prop-value"] input');

	// Error boundary with callback
	await clickNestedText(devtools, "ErrorBoundary2");
	await devtools.waitForSelector(hooksPanel);

	name = await getText(devtools, '[data-testid="prop-name"]');
	value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useErrorBoundary");
	expect(value).to.equal("ƒ ()");
}
