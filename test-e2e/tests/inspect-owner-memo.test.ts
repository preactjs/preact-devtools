import { test, expect } from "@playwright/test";
import { getOwners, gotoTest } from "../pw-utils";

test("Inspect owner information with filtered nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "static-subtree");

	await devtools.locator('[data-name="App"]').click();
	await expect.poll(() => getOwners(devtools)).toEqual([]);

	await devtools.locator('[data-name="Static"]').first().click();
	await expect.poll(() => getOwners(devtools)).toEqual(["App"]);

	await devtools.locator('[data-name="Foo"]').first().click();
	await expect.poll(() => getOwners(devtools)).toEqual(["Static", "App"]);

	await devtools.locator('[data-name="Display"]').first().click();
	await expect.poll(() => getOwners(devtools)).toEqual(["App"]);
});
