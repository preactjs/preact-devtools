import { expect, test } from "@playwright/test";
import {
	locateTab,
	gotoTest,
	wait,
	clickRecordButton,
	locateFlame,
} from "../../pw-utils";

test.only("Captures render reasons for context", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons-context");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testid="toggle-render-reason"]');

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click('[data-testid="counter-1"]');
	await page.click('[data-testid="class-state-multi"]');
	await page.click('[data-testid="counter-2"]');
	await page.click('[data-testid="force-update"]');

	await wait(1000);
	await clickRecordButton(devtools);

	// Class state
	await devtools.locator(locateFlame("Child")).click();
	const reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("State changed:value");
});
