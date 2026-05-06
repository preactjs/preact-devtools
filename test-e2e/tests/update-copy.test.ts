import { test, expect } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Create a copy when doing props/state/context updates", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "update-all");

	const valueInput = devtools
		.locator('[data-testid="prop-value"] input')
		.first();

	// Props
	await devtools.locator(locateTreeItem("Props")).click();
	await expect(valueInput).toHaveValue("0");
	await valueInput.fill("1");
	await page.keyboard.press("Enter");
	await expect(page.locator('[data-testid="props-result"]')).toHaveText(
		"props: 1, true",
	);

	// State
	await devtools.locator(locateTreeItem("State")).click();
	await expect(valueInput).toHaveValue("0");
	await valueInput.fill("1");
	await page.keyboard.press("Enter");
	await expect(page.locator('[data-testid="state-result"]')).toHaveText(
		"state: 1, true",
	);

	// Legacy Context
	await devtools.locator(locateTreeItem("LegacyConsumer")).click();
	await expect(valueInput).toHaveValue("0");
	await valueInput.fill("1");
	await page.keyboard.press("Enter");
	await expect(
		page.locator('[data-testid="legacy-context-result"]'),
	).toHaveText("legacy context: 1");
});
