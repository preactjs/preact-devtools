import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
	wait,
} from "../../pw-utils.ts";

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
	expect(reasons).toEqual("Hooks changed:1");

	// Force update
	await devtools.click('[data-testid="next-commit"]');
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("ForceUpdate")).click();
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Force update");
});

test("Captures hook render reasons", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-multiple");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testid="toggle-render-reason"]');

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click('button:has-text("S1++")');
	await page.click('button:has-text("S2++")');
	await page.click('button:has-text("S3++")');
	await page.click('button:has-text("S1++")');

	await wait(1000);
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("App")).click();

	let reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Hooks changed:1");

	await devtools.click('[data-testid="next-commit"]');
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Hooks changed:2");

	await devtools.click('[data-testid="next-commit"]');
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Hooks changed:3");

	await devtools.click('[data-testid="next-commit"]');
	reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Hooks changed:1");
});
