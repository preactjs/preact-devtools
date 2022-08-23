import { test, expect } from "@playwright/test";
import { getOwners, gotoTest, locateTreeItem } from "../pw-utils";

test("Inspect owner information", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-all");

	await devtools.click(locateTreeItem("App"));

	let owners = await getOwners(devtools);
	expect(owners).toEqual([]);

	await devtools.click(locateTreeItem("Props"));
	owners = await getOwners(devtools);
	expect(owners).toEqual(["App"]);

	await devtools.click(locateTreeItem("State"));
	owners = await getOwners(devtools);
	expect(owners).toEqual(["App"]);

	await devtools.click(locateTreeItem("Context"));
	owners = await getOwners(devtools);
	expect(owners).toEqual(["App"]);

	await devtools.click(locateTreeItem("Provider"));
	owners = await getOwners(devtools);
	expect(owners).toEqual(["Context", "App"]);

	await devtools.click(locateTreeItem("Consumer"));
	owners = await getOwners(devtools);
	expect(owners).toEqual(["Context", "App"]);

	await devtools.click(locateTreeItem("LegacyContext"));
	owners = await getOwners(devtools);
	expect(owners).toEqual(["App"]);

	await devtools.click(locateTreeItem("LegacyConsumer"));
	owners = await getOwners(devtools);
	expect(owners).toEqual(["LegacyContext", "App"]);
});
