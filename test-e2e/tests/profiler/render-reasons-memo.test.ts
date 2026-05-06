import { expect, test } from "@playwright/test";
import {
	locateTab,
	gotoTest,
	wait,
	clickRecordButton,
	locateFlame,
} from "../../pw-utils";

test("Captures render reasons for memo", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons-memo");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testid="toggle-render-reason"]');

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").click();

	await wait(1000);
	await clickRecordButton(devtools);

	// Get render reason
	await devtools.locator(locateFlame("Foo")).click();
	await expect(devtools.locator('[data-testid="render-reasons"]')).toHaveText(
		"Did not render",
	);

	// Elements should be marked as not rendered
	await expect(devtools.locator('[data-name="Foo"]')).toHaveAttribute(
		"data-weight",
		"-1",
	);
	await expect(devtools.locator('[data-name="FooInner"]')).toHaveAttribute(
		"data-weight",
		"-1",
	);
});
