import { test } from "@playwright/test";
import { gotoTest } from "../pw-utils.ts";

test("Display filter no match message", async ({ page }) => {
	const { devtools } = await gotoTest(page, "message-no-results");

	await devtools.locator("data-testid=msg-no-results").waitFor();
});
