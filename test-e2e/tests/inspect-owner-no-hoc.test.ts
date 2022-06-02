import { clickTreeItem, getOwners, newTestPage } from "../test-utils";
import { expect } from "chai";
import {
	clickNestedText,
	clickSelector,
	clickTestId,
	waitForSelector,
	waitForTestId,
} from "pentf/browser_utils";

export const description = "Inspect owner with disabled HOC filter";

export async function run(config: any) {
	const { devtools, page } = await newTestPage(config, "update-hoc");

	await clickTestId(devtools, "filter-menu-button");
	await waitForTestId(devtools, "filter-popup");
	await clickNestedText(devtools, "HOC-Components");
	await clickTestId(devtools, "filter-update");

	await waitForSelector(
		devtools,
		'[data-testid="tree-item"][data-name="Memo(Foo)"]',
	);

	await clickTreeItem(devtools, "List");
	let owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["Counter", "App"]);

	// Trigger update
	await clickSelector(page, "button");
	await waitForSelector(devtools, '[data-testid="elements-tree"]');

	await clickTreeItem(devtools, "ListItem");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["List", "Counter", "App"]);
}
