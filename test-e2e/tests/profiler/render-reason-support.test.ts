import { expect, test } from "@playwright/test";
import {
	locateTab,
	gotoTest,
	wait,
	clickRecordButton,
	locateFlame,
} from "../../pw-utils";

test("Disables render reason capturing", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.locator('[data-testid="toggle-render-reason"]').click();
	await expect(
		devtools.locator('[data-testid="toggle-render-reason"]'),
	).toBeChecked();

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);

	await page.locator('[data-testid="counter-1"]').click();
	await page.locator('[data-testid="counter-2"]').click();
	await wait(1000);

	await clickRecordButton(devtools);

	const reasons = devtools.locator('[data-testid="render-reasons"]');

	await devtools.locator(locateFlame("ComponentState")).click();
	await expect(reasons).toHaveText("State changed:value");

	// Reset flamegraph
	await devtools.locator(locateFlame("Fragment")).click();
	await expect(reasons).toHaveText("Did not render");
});
