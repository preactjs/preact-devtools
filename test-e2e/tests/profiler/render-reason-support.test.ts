import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
	wait,
} from "../../pw-utils.ts";

test("Disables render reason capturing", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testid="toggle-render-reason"]');
	const checked = await devtools
		.locator('[data-testid="toggle-render-reason"]')
		.isChecked();
	expect(checked).toEqual(true);

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);

	await page.click('[data-testid="counter-1"]');
	await page.click('[data-testid="counter-2"]');
	await wait(1000);

	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("ComponentState")).click();
	let reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("State changed:value");

	// Reset flamegraph
	await devtools.locator(locateFlame("Fragment")).click();
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Did not render");
});
