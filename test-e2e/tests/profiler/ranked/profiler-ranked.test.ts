import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateProfilerTab,
} from "../../../pw-utils";

test("Ranked profile view should only show nodes of the current commit", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "profiler-2");

	await devtools.locator(locateTab("PROFILER")).click();
	await devtools.locator(locateProfilerTab("RANKED")).click();

	await clickRecordButton(devtools);
	await page.click('[data-testid="counter-1"]');
	await page.click('[data-testid="counter-2"]');
	await clickRecordButton(devtools);

	const nodes = await devtools.$$(
		'[data-type="ranked"] [data-id]:not([data-weight])',
	);
	expect(nodes.length).toEqual(0);
});
