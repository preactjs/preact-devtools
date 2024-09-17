import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
} from "../../pw-utils.ts";

test("Show in which commit a node rendered", async ({ page }) => {
	const { devtools } = await gotoTest(page, "root-multi");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);

	await page.click("#app button");
	await page.click("#app2 button");
	await page.click("#app button");
	await page.click("#app2 button");

	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("Counter")).click();
	await devtools.waitForSelector('[data-testid="rendered-at"]');

	const items = await devtools
		.locator('[data-testid="rendered-at"] button')
		.count();
	expect(items).toEqual(2);

	let commits = await devtools
		.locator('[data-testid="commit-item"]')
		.evaluateAll((els) =>
			Array.from(els).map((el) => el.getAttribute("data-selected"))
		);
	expect(commits).toEqual(["true", null, null, null]);

	const btns = await devtools
		.locator('[data-testid="rendered-at"] button')
		.evaluateAll((els) =>
			Array.from(els).map((el) => el.getAttribute("data-active"))
		);

	expect(btns).toEqual(["true", null]);

	await devtools.click('[data-testid="rendered-at"] button:not([data-active])');

	commits = await devtools
		.locator('[data-testid="commit-item"]')
		.evaluateAll((els) =>
			Array.from(els).map((el) => el.getAttribute("data-selected"))
		);
	expect(commits).toEqual([null, null, "true", null]);
});
