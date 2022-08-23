import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateFlame,
} from "../../../pw-utils";
import { getFlameNodes } from "../flamegraph/utils";

test("Focus nodes in ranked layout", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-3");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").first().click();
	await page.locator("button").first().click();
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("Counter")).waitFor();

	// Initially only the top node should be focused.
	expect(await getFlameNodes(devtools)).toEqual([
		{ maximized: true, name: "Fragment", hocs: [], visible: true },
		{ maximized: true, name: "Foo", hocs: [], visible: true },
		{ maximized: true, name: "Counter", hocs: [], visible: true },
		{ maximized: false, name: "Display", hocs: [], visible: true },
		{ maximized: false, name: "Value", hocs: [], visible: true },
	]);

	// Focus 2nd node manually
	await devtools.locator(locateFlame("Display")).click();
	expect(await getFlameNodes(devtools)).toEqual([
		{ maximized: true, name: "Fragment", hocs: [], visible: true },
		{ maximized: true, name: "Foo", hocs: [], visible: true },
		{ maximized: true, name: "Counter", hocs: [], visible: true },
		{ maximized: true, name: "Display", hocs: [], visible: true },
		{ maximized: false, name: "Value", hocs: [], visible: true },
	]);

	// Focus 1st node again
	await devtools.locator(locateFlame("Counter")).click();
	expect(await getFlameNodes(devtools)).toEqual([
		{ maximized: true, name: "Fragment", hocs: [], visible: true },
		{ maximized: true, name: "Foo", hocs: [], visible: true },
		{ maximized: true, name: "Counter", hocs: [], visible: true },
		{ maximized: false, name: "Display", hocs: [], visible: true },
		{ maximized: false, name: "Value", hocs: [], visible: true },
	]);
});
