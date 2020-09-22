import { enableHOCFilter, newTestPage, typeText } from "../test-utils";
import { expect } from "chai";
import { getText } from "pentf/browser_utils";
import { assertEventually } from "pentf/assert_utils";

export const description = "HOC-Component labels should be searchable";
export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hoc");
	await enableHOCFilter(devtools);

	await devtools.waitForSelector('[data-testid="tree-item"][data-name="Foo"]');
	await typeText(devtools, '[data-testid="element-search"]', "forw");

	let marked = await devtools.$$("mark");
	expect(marked.length).to.equal(2);
	expect(
		await marked[0].evaluate(el => el.hasAttribute("data-marked")),
	).to.equal(true);

	await assertEventually(
		async () => {
			const text = await getText(devtools, '[data-testid="search-counter"]');
			expect(text).to.equal("1 | 2");
			return true;
		},
		{ timeout: 2000, crashOnError: false },
	);

	await devtools.keyboard.press("Enter");

	marked = await devtools.$$("mark");
	expect(marked.length).to.equal(2);
	expect(
		await marked[1].evaluate(el => el.hasAttribute("data-marked")),
	).to.equal(true);
}
