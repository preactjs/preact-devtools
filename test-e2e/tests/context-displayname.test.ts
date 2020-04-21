import { newTestPage } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "context-displayName", {
		preact: "next",
	});

	const items = await devtools.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map(el => el.textContent);
	});

	expect(items).to.deep.equal(["App", "Foobar.Provider", "Foobar.Consumer"]);
	await closePage(page);
}
