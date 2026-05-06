import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, wait, clickRecordButton } from "../../pw-utils";

test("Disables render reason capturing", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons");

	await devtools.locator(locateTab("SETTINGS")).click();
	await expect(
		devtools.locator('[data-testid="toggle-render-reason"]'),
	).not.toBeChecked();

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator('[data-testid="counter-1"]').click();
	await page.locator('[data-testid="counter-2"]').click();
	await wait(1000);

	await clickRecordButton(devtools);

	const reasons = devtools.locator('[data-testid="render-reasons"]');

	await devtools.locator('[data-name="ComponentState"]').click();
	await expect(reasons).toHaveText("-");

	// Reset flamegraph
	await devtools.locator('[data-name="Fragment"]').click();
	await expect(reasons).toHaveText("Did not render");

	// Enable capturing
	await devtools.locator('[data-testid="toggle-render-reason"]').click();

	// Should start profiling immediately
	await expect(devtools.locator('[data-testid="profiler-info"]')).toContainText(
		"Profiling in progress",
	);

	await clickRecordButton(devtools);

	await devtools.locator(locateTab("SETTINGS")).click();
	await expect(
		devtools.locator('[data-testid="toggle-render-reason"]'),
	).toBeChecked();
});
