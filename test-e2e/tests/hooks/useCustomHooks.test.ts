import { newTestPage, getAttribute, getCount } from "../../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pentf/browser_utils";

export const description = "Inspect custom hooks";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hooks", {
		preact: "hook",
	});

	const hooksPanel = '[data-testid="props-row"]';

	// CutomHook
	await clickText(devtools, "CustomHooks", {
		elementXPath: "//*",
		timeout: 2000,
	});
	await devtools.waitForSelector(hooksPanel, { timeout: 2000 });

	const isCollapsed = await getAttribute(
		devtools,
		`${hooksPanel} button`,
		"data-collapsed",
	);
	expect(isCollapsed).to.equal("true");
	expect(await getCount(devtools, hooksPanel)).to.equal(1);

	await clickText(devtools, "useFoo", {
		elementXPath: "//*",
		timeout: 2000,
	});
	expect(await getCount(devtools, hooksPanel)).to.equal(2);

	await clickText(devtools, "useBar", {
		elementXPath: "//*",
		timeout: 2000,
	});
	expect(await getCount(devtools, hooksPanel)).to.equal(4);

	// Collapse all hooks
	await clickText(devtools, "useFoo", {
		elementXPath: "//*",
		timeout: 2000,
	});
	expect(await getCount(devtools, hooksPanel)).to.equal(1);

	await closePage(page);
}
