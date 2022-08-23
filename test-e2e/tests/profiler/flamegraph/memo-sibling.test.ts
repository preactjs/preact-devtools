import { test, expect } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	waitForPass,
} from "../../../pw-utils";
import assert from "assert";
import { getFlameNodes } from "./utils";

test("Correctly position memoized sibling sub-trees", async ({ page }) => {
	const { devtools } = await gotoTest(page, "memo2");

	await devtools.click('[data-testid="filter-menu-button"]');
	await devtools.waitForSelector('[data-testid="filter-popup"]');
	await devtools.click('[data-testid="add-filter"]');
	await devtools
		.locator('[data-testid="filter-popup"] input[type="text"]')
		.type("Display");

	await devtools.click(
		'[data-testid="filter-popup"] input[type="checkbox"]:not(:checked)',
	);
	await devtools.click('[data-testid="filter-update"]');
	await devtools.click('[data-testid="filter-menu-button"]');

	await waitForPass(async () => {
		await expect(devtools.locator('[data-testid="filter-popup"]')).toHaveCount(
			0,
		);
	});

	await devtools.locator(locateTab("PROFILER")).click();

	await clickRecordButton(devtools);
	await page.click("button");
	await clickRecordButton(devtools);

	const nodes = await getFlameNodes(devtools);
	expect(nodes.sort((a, b) => a.name.localeCompare(b.name))).toEqual(
		[
			{ maximized: true, name: "Fragment", visible: true, hocs: [] },
			{ maximized: true, name: "Counter", visible: true, hocs: [] },
			// TODO: There seems to be an issue with filtered HOCs
			{ maximized: false, name: "Value1", visible: true, hocs: ["Memo"] },
			{ maximized: false, name: "Value2", visible: true, hocs: ["Memo"] },
		].sort((a, b) => a.name.localeCompare(b.name)),
	);

	const memoSize = await devtools
		.locator('[data-type="flamegraph"] [data-testid="flame-node"]')
		.nth(1)
		.boundingBox();
	const staticSize1 = await devtools
		.locator('[data-type="flamegraph"] [data-testid="flame-node"]')
		.nth(2)
		.boundingBox();
	const staticSize2 = await devtools
		.locator('[data-type="flamegraph"] [data-testid="flame-node"]')
		.nth(3)
		.boundingBox();

	assert(memoSize);
	assert(staticSize1);
	assert(staticSize2);

	expect(memoSize.x <= staticSize1.x).toEqual(true);
	expect(
		memoSize.x + memoSize.width >= staticSize1.x + staticSize1.width,
	).toEqual(true);
	expect(memoSize.x <= staticSize2.x).toEqual(true);
	expect(
		memoSize.x + memoSize.width >= staticSize2.x + staticSize2.width,
	).toEqual(true);
});
