import { test } from "@playwright/test";
import { clickTreeItem, gotoTest } from "../../pw-utils.ts";

test('Show "hooks not supported" warning', async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-support", {
		preact: "10.3.4",
	});

	await clickTreeItem(devtools, "RefComponent");
	await devtools.locator('[data-testid="no-hooks-support-warning"]').waitFor();
});
