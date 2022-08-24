import { test, expect } from "@playwright/test";
import { getOwners, gotoTest } from "../pw-utils";

test("Inspect owner information with updated nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-middle");

	await page.click("button");

	await devtools.waitForSelector('[data-testid="elements-tree"]');

	await devtools.click('[data-name="ListItem"]');
	const owners = await getOwners(devtools);
	expect(owners).toEqual(["Counter", "App"]);
});
