import { test, expect } from "@playwright/test";
import { getOwners, gotoTest } from "../pw-utils";

test("Inspect owner information with filtered nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "static-subtree");

	await devtools.click('[data-name="App"]');

	let owners = await getOwners(devtools);
	expect(owners).toEqual([]);

	await devtools.click('[data-name="Static"]');
	owners = await getOwners(devtools);
	expect(owners).toEqual(["App"]);

	await devtools.click('[data-name="Foo"]');
	owners = await getOwners(devtools);
	expect(owners).toEqual(["Static", "App"]);

	await devtools.click('[data-name="Display"]');
	owners = await getOwners(devtools);
	expect(owners).toEqual(["App"]);
});
