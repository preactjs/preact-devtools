import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, clickRecordButton } from "../../pw-utils";

test("Skip memoized components for stats", async ({ page }) => {
	const { devtools } = await gotoTest(page, "memo-stats");

	await devtools.locator(locateTab("STATISTICS")).click();
	await devtools.locator('[data-testId="stats-info"]').waitFor();

	await clickRecordButton(devtools);

	await page.locator("button").click();
	await page.locator('[data-value="1"]').waitFor();
	await clickRecordButton(devtools);

	await expect(devtools.locator('[data-testid="mount-total"]')).toHaveText("0");
	await expect(devtools.locator('[data-testid="update-total"]')).toHaveText(
		"8",
	);
	await expect(devtools.locator('[data-testid="unmount-total"]')).toHaveText(
		"0",
	);
});
