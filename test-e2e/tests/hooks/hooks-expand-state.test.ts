import { newTestPage, getCount } from "../../test-utils";
import { expect } from "chai";
import { clickNestedText, getText } from "pentf/browser_utils";

export const description = "Inspect useRef hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-expand", {
		preact: "hook",
	});

	const row = '[data-testid="props-row"]';

	// State update
	await clickNestedText(devtools, "Memo");
	await devtools.waitForSelector(row);

	const name = await getText(devtools, '[data-testid="prop-name"]');
	expect(name).to.equal("useMemo");

	await clickNestedText(devtools, "useMemo");

	expect(await getCount(devtools, row)).to.equal(2);
}
