import { expect, test } from "@playwright/test";
import { getHooks, getProps, gotoTest, locateTreeItem } from "../pw-utils";

test("Inspect Map and Set objects", async ({ page }) => {
	const { devtools } = await gotoTest(page, "inspect-map-set");

	await devtools.locator(locateTreeItem("App")).click();
	await devtools.locator('[data-testid="Props"]').waitFor();

	await expect(devtools.locator('[data-testid="props-row"]')).toHaveCount(2);

	await expect
		.poll(() => getProps(devtools))
		.toEqual({
			set: "Set(1) [{foo: 123}]",
			map: "Map(1) [[{foo: 123}, 123]]",
		});

	// Edit set
	await devtools.locator('[data-testid="prop-name"][data-type="set"]').click();
	await devtools.locator('[data-testid="props-row"][data-depth="2"]').click();
	await devtools
		.locator('[data-testid="props-row"][data-depth="3"] input')
		.fill("12345");
	await page.keyboard.press("Enter");
	await expect
		.poll(() => page.locator("#json-set").textContent())
		.toEqual(JSON.stringify([{ foo: 12345 }], null, 2));

	// Close set
	await devtools.locator('[data-testid="prop-name"][data-type="set"]').click();

	// Edit map value
	await devtools.locator('[data-type="map"]').click();
	await devtools.locator('[data-testid="props-row"][data-depth="2"]').click();
	await devtools
		.locator('[data-testid="props-row"][data-depth="3"] input')
		.fill("12345");
	await page.keyboard.press("Enter");
	await expect
		.poll(() => page.locator("#json-map").textContent())
		.toEqual(JSON.stringify([[{ foo: 123 }, 12345]], null, 2));

	// Edit map key
	await devtools
		.locator('[data-depth="3"] [data-testid="prop-name"]')
		.first()
		.click();
	await devtools.locator('[name="root.map.0.0.foo"]').fill("111");
	await page.keyboard.press("Enter");
	await expect
		.poll(() => page.locator("#json-map").textContent())
		.toEqual(JSON.stringify([[{ foo: 111 }, 12345]], null, 2));
});

test("Inspect Map and Set objects in hooks", async ({ page }) => {
	const { devtools } = await gotoTest(page, "inspect-map-set-hooks");

	await devtools.locator(locateTreeItem("MapView")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await expect(devtools.locator('[data-testid="props-row"]')).toHaveCount(3);

	await expect
		.poll(() => getHooks(devtools))
		.toEqual([
			["useMemo", "Map(0) []"],
			["useMemo", "Map(1) [[1, 2]]"],
			["useState", "Map(1) [[1, 2]]"],
		]);

	// TODO: Fix editing for both Map and Set

	await devtools.locator(locateTreeItem("SetView")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await expect(devtools.locator('[data-testid="props-row"]')).toHaveCount(3);

	await expect
		.poll(() => getHooks(devtools))
		.toEqual([
			["useMemo", "Set(0) []"],
			["useMemo", "Set(2) [1, 2]"],
			["useState", "Set(2) [1, 2]"],
		]);
});
