import { clickTreeItem, getOwners, newTestPage } from "../test-utils";
import { expect } from "chai";

export const description = "Inspect owner information with filtered nodes";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "static-subtree");

	await clickTreeItem(devtools, "App");

	let owners = await getOwners(devtools);
	expect(owners).to.deep.equal([]);

	await clickTreeItem(devtools, "Static");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["App"]);

	await clickTreeItem(devtools, "Foo");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["Static", "App"]);

	await clickTreeItem(devtools, "Display");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["App"]);
}
