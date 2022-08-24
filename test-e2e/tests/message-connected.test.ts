import { test } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Display filter no match message", async ({ page }) => {
	const { devtools } = await gotoTest(page, "message-connected");

	await devtools.locator("data-testid=msg-only-connected").waitFor();
});
