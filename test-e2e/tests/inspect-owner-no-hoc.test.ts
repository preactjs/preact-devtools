import { test, expect } from "@playwright/test";
import { getOwners, gotoTest } from "../pw-utils";

test("Inspect owner with disabled HOC filter", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-hoc");

	await devtools.click('[data-testid="filter-menu-button"]');
	await devtools.waitForSelector('[data-testid="filter-popup"]');
	await devtools.click(
		'[data-testid="filter-popup"] label:has-text("HOC-Components")',
	);
	await devtools.click('[data-testid="filter-update"]');

	await devtools.waitForSelector(
		'[data-testid="tree-item"][data-name="Memo(Foo)"]',
	);

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
