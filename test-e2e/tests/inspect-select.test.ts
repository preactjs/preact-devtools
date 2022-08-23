import { test, expect } from "@playwright/test";
import { getLog, gotoTest } from "../pw-utils";

test("Should inspect during picking", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	const elem1 = '[data-testid="tree-item"][data-name="Counter"]';
	const prop = '[data-testid="Props"] [data-testid="props-row"]';
	await devtools.click(elem1);
	await expect(devtools.locator(prop)).toHaveCount(0);

	const target = '[data-testid="result"]';
	const inspect = '[data-testid="inspect-btn"]';

	await devtools.click(inspect);
	let active = await devtools.locator(inspect).getAttribute("data-active");
	expect(active).toEqual("true");

	await page.hover(target);

	// Move mouse slightly
	const rect = await page.$eval(target, el => el.getBoundingClientRect());
	await page.mouse.move(rect.x, rect.y);

	// Should load prop data
	await expect(devtools.locator(prop)).toHaveCount(1);

	// Should only fire inspect event once per id
	const inspects = (await getLog(page)).filter(
		x => x.type === "inspect-result",
	);
	expect(inspects.length).toEqual(2);

	// Should select new node in element tree
	await page.click(target);
	active = await devtools.locator(inspect).getAttribute("data-active");
	expect(active).toEqual(null);

	// ...and display the newly inspected data
	await expect(devtools.locator(prop)).toHaveCount(1);
});
