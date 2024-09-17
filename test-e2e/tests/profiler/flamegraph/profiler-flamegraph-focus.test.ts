import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
} from "../../../pw-utils.ts";
import { getFlameNodes } from "./utils.ts";

test("Focus nodes in flamegraph layout", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-3");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");
	await page.click("button");
	await clickRecordButton(devtools);

	// Commit root should be selected initially
	expect(await getFlameNodes(devtools)).toEqual([
		{ maximized: true, name: "Fragment", visible: true, hocs: [] },
		{ maximized: true, name: "Foo", visible: true, hocs: [] },
		{ maximized: true, name: "Counter", visible: true, hocs: [] },
		{ maximized: false, name: "Display", visible: true, hocs: [] },
		{ maximized: false, name: "Value", visible: true, hocs: [] },
	]);

	// Focus 2nd node manually
	await devtools.locator(locateFlame("Counter")).click();
	expect(await getFlameNodes(devtools)).toEqual([
		{ maximized: true, name: "Fragment", visible: true, hocs: [] },
		{ maximized: true, name: "Foo", visible: true, hocs: [] },
		{ maximized: true, name: "Counter", visible: true, hocs: [] },
		{ maximized: false, name: "Display", visible: true, hocs: [] },
		{ maximized: false, name: "Value", visible: true, hocs: [] },
	]);

	// Focus 1st node again
	await devtools.locator(locateFlame("Fragment")).click();
	expect(await getFlameNodes(devtools)).toEqual([
		{ maximized: true, name: "Fragment", visible: true, hocs: [] },
		{ maximized: false, name: "Foo", visible: true, hocs: [] },
		{ maximized: false, name: "Counter", visible: true, hocs: [] },
		{ maximized: false, name: "Display", visible: true, hocs: [] },
		{ maximized: false, name: "Value", visible: true, hocs: [] },
	]);
});
