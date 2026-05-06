import { test, expect } from "@playwright/test";
import { getLog, gotoTest } from "../pw-utils";

test("Should inspect during picking", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	const elem1 = '[data-testid="tree-item"][data-name="Counter"]';
	const prop = '[data-testid="Props"] [data-testid="props-row"]';
	await devtools.locator(elem1).click();
	await expect(devtools.locator(prop)).toHaveCount(0);

	const target = '[data-testid="result"]';
	const inspect = '[data-testid="inspect-btn"]';

	await devtools.locator(inspect).click();
	await expect(devtools.locator(inspect)).toHaveAttribute(
		"data-active",
		"true",
	);

	await page.hover(target);

	// Move mouse slightly
	const rect = await page.$eval(target, el => el.getBoundingClientRect());
	await page.mouse.move(rect.x, rect.y);

	// Should load prop data
	await expect(devtools.locator(prop)).toHaveCount(1);

	// Should only fire inspect event once per id
	await expect
		.poll(
			async () =>
				(await getLog(page)).filter(x => x.type === "inspect-result").length,
		)
		.toEqual(2);

	// Should select new node in element tree
	await page.locator(target).click();
	await expect(devtools.locator(inspect)).toHaveAttribute(
		"data-active",
		"false",
	);

	// ...and display the newly inspected data
	await expect(devtools.locator(prop)).toHaveCount(1);
});
