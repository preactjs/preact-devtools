import {
	clickAndWaitForHooks,
	newTestPage,
	waitForSelector,
} from "../../test-utils";
import { expect } from "chai";
import {
	assertNotSelector,
	clickNestedText,
	getText,
} from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

export const description = "Inspect useContext hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	const hooksPanel = '[data-testid="props-row"]';

	await clickAndWaitForHooks(devtools, "ContextComponent");

	let name = await getText(devtools, '[data-testid="prop-name"]');
	let value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useContext");
	expect(value).to.equal('"foobar"');

	// Should not be collapsable
	await assertNotSelector(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await assertNotSelector(devtools, '[data-testid="prop-value"] input');

	// Check if default value is read when no Provider is present
	await clickNestedText(devtools, "ContextNoProvider");
	await waitForSelector(devtools, hooksPanel, { timeout: 2000 });

	await waitForPass(async () => {
		name = await getText(devtools, '[data-testid="prop-name"]');
		expect(name).to.equal("useContext");
	});

	await waitForPass(async () => {
		value = await getText(devtools, '[data-testid="prop-value"]');
		expect(value).to.equal("0");
	});
}
