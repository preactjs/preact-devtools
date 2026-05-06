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
	await page.locator('[data-testid="counter-1"]').click();
	await page.locator('[data-testid="class-state-multi"]').click();
	await page.locator('[data-testid="counter-2"]').click();
	await page.locator('[data-testid="force-update"]').click();

	await wait(1000);
	await clickRecordButton(devtools);

	const reasons = devtools.locator('[data-testid="render-reasons"]');

	// Class state
	await devtools.locator(locateFlame("ComponentState")).click();
	await expect(reasons).toHaveText("State changed:value");
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("Display")).first().click();
	await expect(reasons).toHaveText("Props changed:value");

	// Class state multiple
	await devtools.locator('[data-testid="next-commit"]').click();
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("ComponentMultiState")).click();
	await expect(reasons).toHaveText("State changed:counter, other");

	// Hooks
	await devtools.locator('[data-testid="next-commit"]').click();
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("HookState")).click();
	await expect(reasons).toHaveText("Hooks changed:1");

	// Force update
	await devtools.locator('[data-testid="next-commit"]').click();
	await devtools.locator(locateFlame("Fragment")).click();

	await devtools.locator(locateFlame("ForceUpdate")).click();
	await expect(reasons).toHaveText("Force update");
});

test("Captures hook render reasons", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-multiple");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testid="toggle-render-reason"]');

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator('button:has-text("S1++")').click();
	await page.locator('button:has-text("S2++")').click();
	await page.locator('button:has-text("S3++")').click();
	await page.locator('button:has-text("S1++")').click();

	await wait(1000);
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("App")).click();

	const reasons = devtools.locator('[data-testid="render-reasons"]');
	await expect(reasons).toHaveText("Hooks changed:1");

	await devtools.locator('[data-testid="next-commit"]').click();
	await expect(reasons).toHaveText("Hooks changed:2");

	await devtools.locator('[data-testid="next-commit"]').click();
	await expect(reasons).toHaveText("Hooks changed:3");

	await devtools.locator('[data-testid="next-commit"]').click();
	await expect(reasons).toHaveText("Hooks changed:1");
});
