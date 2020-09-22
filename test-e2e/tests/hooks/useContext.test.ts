import { newTestPage } from "../../test-utils";
import { expect } from "chai";
import {
	assertNotSelector,
	clickNestedText,
	getText,
} from "pentf/browser_utils";

export const description = "Inspect useContext hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	const hooksPanel = '[data-testid="props-row"]';

	await clickNestedText(devtools, "ContextComponent");
	await devtools.waitForSelector(hooksPanel);

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
	await devtools.waitForSelector(hooksPanel, { timeout: 2000 });

	name = await getText(devtools, '[data-testid="prop-name"]');
	value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useContext");
	expect(value).to.equal("0");
}
