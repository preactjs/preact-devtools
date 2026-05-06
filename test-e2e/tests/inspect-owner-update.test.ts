import { test, expect } from "@playwright/test";
import { getOwners, gotoTest } from "../pw-utils";

test("Inspect owner information with updated nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-middle");

	await page.locator("button").click();

	await devtools.locator('[data-testid="elements-tree"]').waitFor();

	await devtools.locator('[data-name="ListItem"]').click();
	await expect.poll(() => getOwners(devtools)).toEqual(["Counter", "App"]);
});
