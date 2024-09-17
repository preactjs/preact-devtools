import { expect, test } from "@playwright/test";
import { getHooks, getProps, gotoTest, locateTreeItem } from "../pw-utils.ts";

test("Inspect Map and Set objects", async ({ page }) => {
	const { devtools } = await gotoTest(page, "inspect-map-set");

	await devtools.click(locateTreeItem("App"));
	await devtools.waitForSelector('[data-testid="Props"]');

	const count = await devtools.locator('[data-testid="props-row"]').count();
	expect(count).toEqual(2);

	const props = await getProps(devtools);
	expect(props).toEqual({
		set: "Set(1) [{foo: 123}]",
		map: "Map(1) [[{foo: 123}, 123]]",
	});

	// Edit set
	await devtools.click('[data-testid="prop-name"][data-type="set"]');
	await devtools.click('[data-testid="props-row"][data-depth="2"]');
	await devtools.fill(
		'[data-testid="props-row"][data-depth="3"] input',
		"12345",
	);
	await page.keyboard.press("Enter");
	let text = await page.locator("#json-set").textContent();
	expect(text).toEqual(JSON.stringify([{ foo: 12345 }], null, 2));

	// Close set
	await devtools.click('[data-testid="prop-name"][data-type="set"]');

	// Edit map value
	await devtools.click('[data-type="map"]');
	await devtools.click('[data-testid="props-row"][data-depth="2"]');
	await devtools.fill(
		'[data-testid="props-row"][data-depth="3"] input',
		"12345",
	);
	await page.keyboard.press("Enter");
	text = await page.locator("#json-map").textContent();
	expect(text).toEqual(JSON.stringify([[{ foo: 123 }, 12345]], null, 2));

	// Edit map key
	await devtools.click('[data-depth="3"] [data-testid="prop-name"]');
	await devtools.fill('[name="root.map.0.0.foo"]', "111");
	await page.keyboard.press("Enter");
	text = await page.locator("#json-map").textContent();
	expect(text).toEqual(JSON.stringify([[{ foo: 111 }, 12345]], null, 2));
});

test("Inspect Map and Set objects in hooks", async ({ page }) => {
	const { devtools } = await gotoTest(page, "inspect-map-set-hooks");

	await devtools.click(locateTreeItem("MapView"));
	await devtools.waitForSelector('[data-testid="Hooks"]');

	const count = await devtools.locator('[data-testid="props-row"]').count();
	expect(count).toEqual(3);

	const props = await getHooks(devtools);
	expect(props).toEqual([
		["useMemo", "Map(0) []"],
		["useMemo", "Map(1) [[1, 2]]"],
		["useState", "Map(1) [[1, 2]]"],
	]);

	// TODO: Fix editing for both Map and Set

	await devtools.click(locateTreeItem("SetView"));
	await devtools.waitForSelector('[data-testid="Hooks"]');

	const count2 = await devtools.locator('[data-testid="props-row"]').count();
	expect(count2).toEqual(3);

	const props2 = await getHooks(devtools);
	expect(props2).toEqual([
		["useMemo", "Set(0) []"],
		["useMemo", "Set(2) [1, 2]"],
		["useState", "Set(2) [1, 2]"],
	]);
});
