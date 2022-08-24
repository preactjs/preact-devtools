import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, clickRecordButton } from "../../pw-utils";

test("Skip memoized components for stats", async ({ page }) => {
	const { devtools } = await gotoTest(page, "memo-stats");

	await devtools.locator(locateTab("STATISTICS")).click();
	await devtools.waitForSelector('[data-testId="stats-info"]');

	await clickRecordButton(devtools);

	await page.click("button");
	await page.waitForSelector('[data-value="1"]');
	await clickRecordButton(devtools);

	const mountTotal = await devtools
		.locator('[data-testid="mount-total"]')
		.textContent();
	expect(mountTotal).toEqual("0");

	const updateTotal = await devtools
		.locator('[data-testid="update-total"]')
		.textContent();
	expect(updateTotal).toEqual("8");

	const unmountTotal = await devtools
		.locator('[data-testid="unmount-total"]')
		.textContent();
	expect(unmountTotal).toEqual("0");
});
