import { test, expect } from "@playwright/test";
import { getLog, gotoTest, wait } from "../pw-utils";

test("Inspect should select node in elements panel", async ({ page }) => {
	const { devtools } = await gotoTest(page, "counter");

	await devtools.locator("data-testid=inspect-btn").click();
	await page.hover("[data-testid=result]");
	// Wait for possible flickering to occur
	await wait(500);

	await page.click("[data-testid=result]");

	// Wait for possible flickering to occur
	await wait(500);

	const log = await getLog(page);
	expect(log.filter(x => x.type === "start-picker").length).toEqual(1);
	expect(log.filter(x => x.type === "stop-picker").length).toEqual(1);
	// expect(log.filter(x => x.type === "start-picker").length).to.equal(1);
	// expect(log.filter(x => x.type === "stop-picker").length).to.equal(1);

	await devtools.locator('[data-selected="true"]:has-text("Display)');
});
