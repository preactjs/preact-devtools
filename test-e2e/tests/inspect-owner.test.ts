import { clickTreeItem, getOwners, newTestPage } from "../test-utils";
import { expect } from "chai";

export const description = "Inspect owner information";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "update-all");

	await clickTreeItem(devtools, "App");

	let owners = await getOwners(devtools);
	expect(owners).to.deep.equal([]);

	await clickTreeItem(devtools, "Props");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["App"]);

	await clickTreeItem(devtools, "State");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["App"]);

	await clickTreeItem(devtools, "Context");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["App"]);

	await clickTreeItem(devtools, "Provider");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["Context", "App"]);

	await clickTreeItem(devtools, "Consumer");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["Context", "App"]);

	await clickTreeItem(devtools, "LegacyContext");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["App"]);

	await clickTreeItem(devtools, "LegacyConsumer");
	owners = await getOwners(devtools);
	expect(owners).to.deep.equal(["LegacyContext", "App"]);
}
