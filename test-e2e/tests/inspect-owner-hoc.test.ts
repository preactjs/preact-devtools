import { clickTreeItem, getOwners, newTestPage } from "../test-utils";
import { expect } from "chai";
import { clickSelector, waitForSelector } from "pentf/browser_utils";

export const description = "Inspect owner with fake HOC";

export async function run(config: any) {
	const { devtools, page } = await newTestPage(config, "update-fake-hoc");

	await waitForSelector(page, "button");

	await clickTreeItem(devtools, "List");
	let owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["Foo", "App"]);

	// Trigger update
	await clickSelector(page, "button");
	await waitForSelector(devtools, '[data-testid="elements-tree"]');

	await clickTreeItem(devtools, "ListItem");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["List", "Foo", "App"]);
}
