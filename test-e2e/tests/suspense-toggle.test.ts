import { newTestPage, getTreeViewItemNames } from "../test-utils";
import { expect } from "chai";
import {
	assertNotTestId,
	clickSelector,
	clickTestId,
	getAttribute,
	getText,
} from "pentf/browser_utils";
import { assertEventually } from "pentf/assert_utils";

export const description = "Display Suspense in tree view";
export async function run(config: any) {
	const { devtools } = await newTestPage(config, "suspense");

	await devtools.waitForSelector(
		'[data-testid="tree-item"][data-name="Delayed"]',
	);

	await clickSelector(
		devtools,
		'[data-testid="tree-item"][data-name="Delayed"]',
	);

	await clickTestId(devtools, "suspend-action");

	await assertEventually(
		async () => {
			const items = await getTreeViewItemNames(devtools);
			expect(items).to.deep.equal([
				"Shortly",
				"Block",
				"Suspense",
				"Component", // <10.4.5, newer versions use a Fragment
				"Block",
			]);
			return true;
		},
		{ crashOnError: false, timeout: 2000 },
	);

	const selected = await getAttribute(
		devtools,
		'[data-testid="tree-item"][data-selected="true"]',
		"data-name",
	);

	expect(selected).to.equal("Suspense");

	await clickSelector(
		devtools,
		'[data-testid="tree-item"][data-name="Shortly"]',
		{ timeout: 2000 },
	);

	await assertEventually(
		async () => {
			const inspected = await getText(
				devtools,
				'[data-testid="inspect-component-name"]',
			);
			expect(inspected).to.equal("<Shortly>");
			return true;
		},
		{ crashOnError: false, timeout: 2000 },
	);

	await assertNotTestId(devtools, "suspend-action", { timeout: 2000 });
}
