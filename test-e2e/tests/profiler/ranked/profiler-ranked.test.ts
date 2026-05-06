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
	await page.locator('[data-testid="counter-1"]').click();
	await page.locator('[data-testid="counter-2"]').click();
	await clickRecordButton(devtools);

	await expect(
		devtools.locator('[data-type="ranked"] [data-id]:not([data-weight])'),
	).toHaveCount(0);
});
