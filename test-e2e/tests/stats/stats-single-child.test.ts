import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, clickRecordButton } from "../../pw-utils";

test("Display single child stats", async ({ page }) => {
	const { devtools } = await gotoTest(page, "simple-stats");

	await devtools.locator(locateTab("STATISTICS")).click();
	await devtools.locator('[data-testId="stats-info"]').waitFor();

	await clickRecordButton(devtools);
	await devtools.locator('[data-testid="stats-info-recording"]').waitFor();

	await page.locator('[data-testid="update"]').click();
	await clickRecordButton(devtools);

	await expect(
		devtools.locator('[data-testid="single-class-component"]'),
	).toHaveText("0");
	await expect(
		devtools.locator('[data-testid="single-function-component"]'),
	).toHaveText("0");
	await expect(devtools.locator('[data-testid="single-element"]')).toHaveText(
		"2",
	);
	await expect(devtools.locator('[data-testid="single-text"]')).toHaveText("3");
});
