import { test, expect } from "@playwright/test";
import { getLog, gotoTest } from "../pw-utils";

test("Inspect should select node in elements panel", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator("data-testid=inspect-btn").click();
	await page.hover("[data-testid=result]");

	await expect
		.poll(
			async () =>
				(await getLog(page)).filter(x => x.type === "start-picker").length,
		)
		.toEqual(1);

	await page.locator("[data-testid=result]").click();

	await expect
		.poll(
			async () =>
				(await getLog(page)).filter(x => x.type === "stop-picker").length,
		)
		.toEqual(1);

	await devtools
		.locator('[data-selected="true"]:has-text("Display")')
		.waitFor();
});
