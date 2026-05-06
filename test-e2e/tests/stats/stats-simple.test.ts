import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, clickRecordButton } from "../../pw-utils";

test("Display simple stats", async ({ page }) => {
	const { devtools } = await gotoTest(page, "simple-stats");

	await devtools.locator(locateTab("STATISTICS")).click();
	await devtools.locator('[data-testId="stats-info"]').waitFor();

	await clickRecordButton(devtools);
	await devtools.locator('[data-testid="stats-info-recording"]').waitFor();

	await page.locator('[data-testid="update"]').click();
	await clickRecordButton(devtools);

	await expect(
		devtools.locator('[data-testid="class-component-total"]'),
	).toHaveText("1");
	await expect(
		devtools.locator('[data-testid="function-component-total"]'),
	).toHaveText("1");
	await expect(devtools.locator('[data-testid="fragment-total"]')).toHaveText(
		"0",
	);
	await expect(devtools.locator('[data-testid="element-total"]')).toHaveText(
		"5",
	);
	await expect(devtools.locator('[data-testid="text-total"]')).toHaveText("6");
});
