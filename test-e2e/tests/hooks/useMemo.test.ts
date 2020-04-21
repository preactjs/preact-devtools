import { newTestPage, getText, checkNotPresent } from "../../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pentf/browser_utils";

export const description = "Inspect useMemo hook";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hooks", {
		preact: "hook",
	});

	const hooksPanel = '[data-testid="props-row"]';

	// State update
	await clickText(devtools, "Memo", { elementXPath: "//*", timeout: 2000 });
	await devtools.waitForSelector(hooksPanel, { timeout: 2000 });

	const name = await getText(devtools, '[data-testid="prop-name"]');
	const value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useMemo");
	expect(value).to.equal("0");

	// Should not be collapsable
	await checkNotPresent(devtools, '[data-testid="props-row"] > button');

	// Should not be editable
	await checkNotPresent(devtools, '[data-testid="prop-value"] input');

	await closePage(page);
}
