import { test, expect } from "@playwright/test";
import { getOwners, gotoTest } from "../pw-utils";

test("Inspect owner with fake HOC", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-hoc");

	await page.waitForSelector("button");

	await devtools.click('[data-name="List"]');
	let owners = await getOwners(devtools);
	expect(owners).toEqual(["Counter", "App"]);

	// Trigger update
	await page.click("button");
	await devtools.waitForSelector('[data-testid="elements-tree"]');

	await devtools.click('[data-name="ListItem"]');
	owners = await getOwners(devtools);
	expect(owners).toEqual(["List", "Counter", "App"]);
});
