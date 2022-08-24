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
