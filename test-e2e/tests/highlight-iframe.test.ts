import { newTestPage, getText$$ } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";

export const description = "Mirror component state to the devtools";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "iframe", {
		preact: "next",
	});

	const elements = await getText$$(devtools, '[data-testid="tree-item"]');
	expect(elements).to.deep.equal([
		"View",
		"Counter",
		"Display",
		"App",
		"Foobar.Provider",
		"Foobar.Consumer",
	]);

	await closePage(page);
}
