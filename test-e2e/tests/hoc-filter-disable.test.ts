import { enableHOCFilter, newTestPage, waitForSelector } from "../test-utils";
import { expect } from "chai";
import {
	assertNotTestId,
	clickNestedText,
	clickTestId,
	waitForTestId,
} from "pentf/browser_utils";

export const description = "HOC-Component filter should be disabled";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hoc");
	await enableHOCFilter(devtools);

	await clickTestId(devtools, "filter-menu-button");
	await waitForTestId(devtools, "filter-popup");
	await clickNestedText(devtools, "HOC-Components");
	await clickTestId(devtools, "filter-update");

	await waitForSelector(
		devtools,
		'[data-testid="tree-item"][data-name="Memo(Foo)"]',
	);

	const items = await devtools.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map(el => el.getAttribute("data-name"));
	});

	expect(items).to.deep.equal([
		"Memo(Foo)",
		"Foo",
		"ForwardRef(Bar)",
		"ForwardRef()",
		"withBoof(Foo)",
		"Foo",
		"withBoof(Memo(Last))",
		"Memo(Last)",
		"Last",
	]);

	await assertNotTestId(devtools, "hoc-panel");
}
