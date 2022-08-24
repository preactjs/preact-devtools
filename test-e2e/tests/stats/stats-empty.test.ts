import { expect, test } from "@playwright/test";
import { locateTab, gotoTest } from "../../pw-utils";

test("Display no stats initially", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator(locateTab("STATISTICS")).click();
	await devtools.waitForSelector('[data-testId="stats-info"]');

	await expect(devtools.locator('[data-testid="vnode-stats"]')).toHaveCount(0);
});
