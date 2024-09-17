import { test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils.ts";

test("Create a copy when doing props/state/context updates", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-all");

	// Props
	await devtools.click(locateTreeItem("Props"));
	await devtools.fill('[data-testid="prop-value"] input', "1");
	await page.keyboard.press("Enter");
	await page
		.locator('[data-testid="props-result"]:has-text("props: 1, true")')
		.waitFor();

	// State
	await devtools.click(locateTreeItem("State"));
	await devtools.fill('[data-testid="prop-value"] input', "1");
	await page.keyboard.press("Enter");
	await page
		.locator('[data-testid="state-result"]:has-text("state: 1, true")')
		.waitFor();

	// Legacy Context
	await devtools.click(locateTreeItem("LegacyConsumer"));
	await devtools.fill('[data-testid="prop-value"] input', "1");
	await page.keyboard.press("Enter");
	await page
		.locator(
			'[data-testid="legacy-context-result"]:has-text("legacy context: 1")',
		)
		.waitFor();
});
