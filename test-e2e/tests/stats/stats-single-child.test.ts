import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, clickRecordButton } from "../../pw-utils";

test("Display single child stats", async ({ page }) => {
	const { devtools } = await gotoTest(page, "simple-stats");

	await devtools.locator(locateTab("STATISTICS")).click();
	await devtools.waitForSelector('[data-testId="stats-info"]');

	await clickRecordButton(devtools);
	await devtools.waitForSelector('[data-testid="stats-info-recording"]');

	await page.click('[data-testid="update"]');
	await clickRecordButton(devtools);

	const classComponents = await devtools
		.locator('[data-testid="single-class-component"]')
		.textContent();
	expect(classComponents).toEqual("0");

	const fnComponents = await devtools
		.locator('[data-testid="single-function-component"]')
		.textContent();
	expect(fnComponents).toEqual("0");

	const elements = await devtools
		.locator('[data-testid="single-element"]')
		.textContent();
	expect(elements).toEqual("2");

	const texts = await devtools
		.locator('[data-testid="single-text"]')
		.textContent();
	expect(texts).toEqual("3");
});
