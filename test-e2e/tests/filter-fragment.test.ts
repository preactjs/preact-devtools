import { newTestPage, getTreeViewItemNames } from "../test-utils";
import { expect } from "chai";
import { waitForPass } from "pentf/assert_utils";

export const description = "Fragment filter should filter Fragment nodes";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "fragment-filter", {
		preact: "10.4.1",
	});

	await waitForPass(async () => {
		const names = await getTreeViewItemNames(devtools);
		expect(names).to.deep.equal(["Foo"]);
	});
}
