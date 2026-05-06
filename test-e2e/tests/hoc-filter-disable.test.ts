import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("HOC-Component filter should be disabled", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc");

	await devtools.click('[data-testid="filter-menu-button"]');
	await devtools.waitForSelector('[data-testid="filter-popup"]');
	await devtools.click(
		'[data-testid="filter-popup"] label:has-text("HOC-Components")',
	);
	await devtools.click('[data-testid="filter-update"]');
	await devtools.locator('[data-testid="element-search"]').click();
	await expect(devtools.locator('[data-testid="filter-popup"]')).toBeHidden();

	await devtools.waitForSelector(locateTreeItem("Memo(Foo)"));

	const items = await devtools
		.locator('[data-testid="tree-item"]')
		.evaluateAll(els =>
			Array.from(els).map(el => el.getAttribute("data-name")),
		);

	expect(items).toEqual([
		"Memo(Foo)",
		"Foo",
		"ForwardRef(Bar)",
		"ForwardRef()",
		"withBoof(Foo)",
		"Foo",
		"withBoof(Memo(Last))",
		"Memo(Last)",
		"Last",
	]);

	await expect(devtools.locator('[data-testid="hoc-panel"]')).toHaveCount(0);
});

test("Custom filter should stay removed after submitting", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc");
	const filterPopup = devtools.locator('[data-testid="filter-popup"]');
	const customFilters = filterPopup.locator('input[type="text"]');

	await devtools.click('[data-testid="filter-menu-button"]');
	await filterPopup.waitFor();

	await devtools.locator('[data-testid="add-filter"]').click();
	await expect(customFilters).toHaveCount(1);
	await customFilters.first().fill("Foo");
	await devtools.click('[data-testid="filter-update"]');

	await devtools.locator('[data-testid="element-search"]').click();
	await expect(filterPopup).toBeHidden();

	await devtools.click('[data-testid="filter-menu-button"]');
	await expect(customFilters).toHaveValue("Foo");

	await devtools.locator('[data-testid="remove-filter"]').click();
	await expect(customFilters).toHaveCount(0);
	await devtools.click('[data-testid="filter-update"]');

	await devtools.locator('[data-testid="element-search"]').click();
	await expect(filterPopup).toBeHidden();

	await devtools.click('[data-testid="filter-menu-button"]');
	await expect(customFilters).toHaveCount(0);
});

test("Custom filter should stay removed after closing without submit", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "hoc");
	const filterPopup = devtools.locator('[data-testid="filter-popup"]');
	const customFilters = filterPopup.locator('input[type="text"]');

	await devtools.click('[data-testid="filter-menu-button"]');
	await filterPopup.waitFor();

	await devtools.locator('[data-testid="add-filter"]').click();
	await customFilters.first().fill("Foo");
	await devtools.click('[data-testid="filter-update"]');

	await devtools.locator('[data-testid="remove-filter"]').click();
	await expect(customFilters).toHaveCount(0);

	await devtools.locator('[data-testid="element-search"]').click();
	await expect(filterPopup).toBeHidden();

	await devtools.click('[data-testid="filter-menu-button"]');
	await expect(customFilters).toHaveCount(0);
});
