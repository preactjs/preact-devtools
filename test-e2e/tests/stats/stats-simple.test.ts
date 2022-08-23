import { expect, test } from "@playwright/test";
import { locateTab, gotoTest, clickRecordButton } from "../../pw-utils";

test("Display simple stats", async ({ page }) => {
	const { devtools } = await gotoTest(page, "simple-stats");

	await devtools.locator(locateTab("STATISTICS")).click();
	await devtools.waitForSelector('[data-testId="stats-info"]');

	await clickRecordButton(devtools);
	await devtools.waitForSelector('[data-testid="stats-info-recording"]');

	await page.click('[data-testid="update"]');
	await clickRecordButton(devtools);

	const classComponents = await devtools
		.locator('[data-testid="class-component-total"]')
		.textContent();
	expect(classComponents).toEqual("1");

	const fnComponents = await devtools
		.locator('[data-testid="function-component-total"]')
		.textContent();
	expect(fnComponents).toEqual("1");

	const fragmentsCount = await devtools
		.locator('[data-testid="fragment-total"]')
		.textContent();
	expect(fragmentsCount).toEqual("0");

	const elementsCount = await devtools
		.locator('[data-testid="element-total"]')
		.textContent();
	expect(elementsCount).toEqual("5");

	const textCount = await devtools
		.locator('[data-testid="text-total"]')
		.textContent();
	expect(textCount).toEqual("6");
});
