import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateTab,
	wait,
} from "../../pw-utils.ts";

test("Disables render reason capturing", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons");

	await devtools.locator(locateTab("SETTINGS")).click();
	let checked = await devtools
		.locator('[data-testid="toggle-render-reason"]')
		.isChecked();
	expect(checked).toEqual(false);

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click('[data-testid="counter-1"]');
	await page.click('[data-testid="counter-2"]');
	await wait(1000);

	await clickRecordButton(devtools);

	await devtools.click('[data-name="ComponentState"]');
	let reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("-");

	// Reset flamegraph
	await devtools.click('[data-name="Fragment"]');
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Did not render");

	// Enable capturing
	await devtools.click('[data-testid="toggle-render-reason"]');

	// Should start profiling immediately
	const text = await devtools
		.locator('[data-testid="profiler-info"]')
		.textContent();
	expect(text).toMatch(/Profiling in progress/);

	await clickRecordButton(devtools);

	await devtools.locator(locateTab("SETTINGS")).click();
	checked = await devtools
		.locator('[data-testid="toggle-render-reason"]')
		.isChecked();
	expect(checked).toEqual(true);
});
