import { expect, test } from "@playwright/test";
import {
	locateTab,
	gotoTest,
	wait,
	clickRecordButton,
	locateFlame,
} from "../../pw-utils";

test("Captures render reasons", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons");

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
	await devtools.locator(locateFlame("ComponentState")).click();
	let reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("State changed:value");
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("Display")).first().click();
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Props changed:value");

	// Class state multiple
	await devtools.click('[data-testid="next-commit"]');
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("ComponentMultiState")).click();
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("State changed:counter, other");

	// Hooks
	await devtools.click('[data-testid="next-commit"]');
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("HookState")).click();
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Hooks changed:");

	// Force update
	await devtools.click('[data-testid="next-commit"]');
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("ForceUpdate")).click();
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Force update");
});
