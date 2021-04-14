import { clickTab, enableHOCFilter, newTestPage } from "../test-utils";
import { expect } from "chai";
import {
	clickNestedText,
	clickTestId,
	waitForTestId,
} from "pentf/browser_utils";
import { assertEventually, waitForPass } from "pentf/assert_utils";

export const description = "HOC-Component filter should be behind feature flag";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hoc");

	await clickTestId(devtools, "filter-menu-button");
	await waitForTestId(devtools, "filter-popup");

	await assertEventually(
		async () => {
			try {
				await clickNestedText(devtools, "HOC-Components");
				return false;
			} catch (e) {
				return true;
			}
		},
		{ timeout: 2000 },
	);

	await enableHOCFilter(devtools);

	// Disable experimental filters should refresh tree view
	await clickTab(devtools, "SETTINGS");
	await clickTestId(devtools, "toggle-experimental-filters");
	await clickTab(devtools, "ELEMENTS");

	await waitForPass(async () => {
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
	});
}
