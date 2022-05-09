import { newTestPage, waitForSelector } from "../test-utils";
import { expect } from "chai";
import { clickNestedText, waitForTestId } from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

export const description = "HOC-Component filter should flatten tree";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hoc");

	await waitForSelector(devtools, '[data-testid="tree-item"][data-name="Foo"]');

	const items = await devtools.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map(el => el.getAttribute("data-name"));
	});

	expect(items).to.deep.equal(["Foo", "Bar", "Anonymous", "Foo", "Last"]);

	await clickNestedText(devtools, "Anonymous");
	await waitForTestId(devtools, "hoc-panel");

	async function getSidebarHocs() {
		return await devtools.evaluate(() => {
			return Array.from(
				document.querySelectorAll('[data-testid="hoc-panel"] .hoc-item'),
			).map(el => el.textContent);
		});
	}

	const hocs = await getSidebarHocs();
	expect(hocs).to.deep.equal(["ForwardRef"]);

	await clickNestedText(devtools, "Last");

	await waitForPass(
		async () => {
			const hocs2 = await getSidebarHocs();
			expect(hocs2).to.deep.equal(["withBoof", "Memo"]);
		},
		{ timeout: 2000 },
	);
}
