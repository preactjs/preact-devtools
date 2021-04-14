import { newTestPage } from "../test-utils";
import { expect } from "chai";
import { waitForPass } from "pentf/assert_utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "context-displayName");

	await waitForPass(async () => {
		const items = await devtools.evaluate(() => {
			return Array.from(
				document.querySelectorAll('[data-testid="tree-item"]'),
			).map(el => el.textContent);
		});

		expect(items).to.deep.equal(["App", "Foobar.Provider", "Foobar.Consumer"]);
	});
}
