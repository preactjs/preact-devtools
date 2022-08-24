import { test } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateProfilerTab,
} from "../../../pw-utils";

test("Selected node should be changed across commits if not present", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "profiler-2");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator('[data-testid="counter-1"]').click();
	await page.locator('[data-testid="counter-2"]').click();
	await clickRecordButton(devtools);

	await devtools.locator(locateProfilerTab("RANKED")).click();
	await devtools.click('[data-type="ranked"] [data-name="Display"]');
	await devtools.click('[data-testid="next-commit"]');

	await devtools.waitForSelector('[data-type="ranked"] [data-selected="true"]');
});
