import { newTestPage, getTreeViewItemNames } from "../test-utils";
import { expect } from "chai";
import { waitForTestId } from "pentf/browser_utils";
import { assertEventually } from "pentf/assert_utils";

async function runTest(config: any, version: string) {
	const { devtools } = await newTestPage(config, "suspense", {
		preact: version,
	});

	await waitForTestId(devtools, "tree-item");

	const items = await getTreeViewItemNames(devtools);
	expect(items).to.deep.equal(
		[
			"Shortly",
			"Block",
			"Suspense",
			version === "10.4.1" && "Component",
			"Block",
		].filter(Boolean),
	);

	await assertEventually(
		async () => {
			const items = await getTreeViewItemNames(devtools);
			expect(items).to.deep.equal(
				[
					"Shortly",
					"Block",
					"Suspense",
					version === "10.4.1" && "Component",
					"Delayed",
					"Block",
				].filter(Boolean),
			);
		},
		{ crashOnError: false, timeout: 5000 },
	);
}

export const description = "Display Suspense in tree view";
export async function run(config: any) {
	await runTest(config, "10.5.9");

	// <10.4.5, uses a component instead of a Fragment as the boundary
	await runTest(config, "10.4.1");
}
