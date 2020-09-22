import { newTestPage, getTreeViewItemNames } from "../test-utils";
import { expect } from "chai";
import { waitForTestId } from "pentf/browser_utils";
import { assertEventually } from "pentf/assert_utils";

export const description = "Display Suspense in tree view";
export async function run(config: any) {
	const { devtools } = await newTestPage(config, "suspense");

	await waitForTestId(devtools, "tree-item");

	const items = await getTreeViewItemNames(devtools);
	expect(items).to.deep.equal([
		"Shortly",
		"Block",
		"Suspense",
		"Component",
		"Block",
	]);

	await assertEventually(
		async () => {
			const items = await getTreeViewItemNames(devtools);
			expect(items).to.deep.equal([
				"Shortly",
				"Block",
				"Suspense",
				"Component",
				"Delayed",
				"Block",
			]);
		},
		{ crashOnError: false, timeout: 5000 },
	);
}
