import { newTestPage } from "../test-utils";
import { expect } from "chai";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "context-displayName");

	const items = await devtools.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map(el => el.textContent);
	});

	expect(items).to.deep.equal(["App", "Foobar.Provider", "Foobar.Consumer"]);
}
