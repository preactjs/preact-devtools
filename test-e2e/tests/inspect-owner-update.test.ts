import { clickTreeItem, getOwners, newTestPage } from "../test-utils";
import { expect } from "chai";
import { clickSelector, waitForSelector } from "pentf/browser_utils";

export const description = "Inspect owner information with updated nodes";

export async function run(config: any) {
	const { devtools, page } = await newTestPage(config, "update-middle");

	await clickSelector(page, "button");
	await waitForSelector(devtools, '[data-testid="elements-tree"]');

	await clickTreeItem(devtools, "ListItem");
	const owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["Counter", "App"]);
}
