import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
	wait,
} from "../../pw-utils.ts";

test("Captures render reasons for memo", async ({ page }) => {
	const { devtools } = await gotoTest(page, "render-reasons-memo");

	await devtools.locator(locateTab("SETTINGS")).click();
	await devtools.click('[data-testid="toggle-render-reason"]');

	// Start profiling
	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.click("button");

	await wait(1000);
	await clickRecordButton(devtools);

	// Get render reason
	await devtools.locator(locateFlame("Foo")).click();
	const reasons = await devtools
		.locator('[data-testid="render-reasons"]')
		.textContent();
	expect(reasons).toEqual("Did not render");

	// Elements should be marked as not rendered
	const Foo = await devtools
		.locator('[data-name="Foo"]')
		.getAttribute("data-weight");
	const Inner = await devtools
		.locator('[data-name="FooInner"]')
		.getAttribute("data-weight");

	expect(Foo).toEqual("-1");
	expect(Inner).toEqual("-1");
});
