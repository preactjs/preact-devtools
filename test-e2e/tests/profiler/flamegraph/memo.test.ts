import { expect, test } from "@playwright/test";
import { clickRecordButton, gotoTest, locateTab } from "../../../pw-utils.ts";
import assert from "node:assert";
import { getFlameNodes } from "./utils.ts";

test("Correctly position memoized sub-trees", async ({ page }) => {
	const { devtools } = await gotoTest(page, "memo");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");
	await clickRecordButton(devtools);

	const nodes = await getFlameNodes(devtools);
	expect(nodes).toEqual([
		{ maximized: true, name: "Fragment", visible: true, hocs: [] },
		{ maximized: true, name: "Counter", visible: true, hocs: [] },
		{ maximized: false, name: "Display", visible: true, hocs: ["Memo"] },
		{ maximized: false, name: "Value", visible: true, hocs: [] },
		{ maximized: false, name: "Value", visible: true, hocs: [] },
	]);

	const memoSize = await devtools
		.locator('[data-type="flamegraph"] [data-testid="flame-node"]')
		.nth(2)
		.boundingBox();
	const staticSize = await devtools
		.locator('[data-type="flamegraph"] [data-testid="flame-node"]')
		.nth(3)
		.boundingBox();

	assert(memoSize);
	assert(staticSize);

	expect(memoSize.x <= staticSize.x).toEqual(true);
	expect(
		memoSize.x + memoSize.width >= staticSize.x + staticSize.width,
	).toEqual(true);
});
