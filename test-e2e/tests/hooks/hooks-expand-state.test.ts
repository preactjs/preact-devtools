import { newTestPage, getCount } from "../../test-utils";
import { expect } from "chai";
import { clickText, getText } from "pentf/browser_utils";

export const description = "Inspect useRef hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-expand", {
		preact: "hook",
	});

	const row = '[data-testid="props-row"]';

	// State update
	await clickText(devtools, "Memo", {
		elementXPath: "//*",
		timeout: 2000,
	});
	await devtools.waitForSelector(row);

	const name = await getText(devtools, '[data-testid="prop-name"]');
	expect(name).to.equal("useMemo");

	await clickText(devtools, "useMemo", {
		elementXPath: "//*",
		timeout: 2000,
	});

	expect(await getCount(devtools, row)).to.equal(2);
}
