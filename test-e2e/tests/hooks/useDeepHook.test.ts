import { newTestPage, getCount, clickAndWaitForHooks } from "../../test-utils";
import { expect } from "chai";
import { clickNestedText, getAttribute } from "pentf/browser_utils";

export const description = "Inspect custom hooks";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks");

	const hooksPanel = '[data-testid="props-row"]';

	// CutomHook
	await clickAndWaitForHooks(devtools, "CustomHooks3");

	const isCollapsed = await getAttribute(
		devtools,
		`${hooksPanel} button`,
		"data-collapsed",
	);
	expect(isCollapsed).to.equal("true");
	expect(await getCount(devtools, hooksPanel)).to.equal(2);

	await clickNestedText(devtools, "useBoof");
	expect(await getCount(devtools, hooksPanel)).to.equal(3);

	await clickNestedText(devtools, "useBob");
	expect(await getCount(devtools, hooksPanel)).to.equal(4);

	await clickNestedText(devtools, "useFoo");
	expect(await getCount(devtools, hooksPanel)).to.equal(5);

	await clickNestedText(devtools, "useBar");
	expect(await getCount(devtools, hooksPanel)).to.equal(7);
}
