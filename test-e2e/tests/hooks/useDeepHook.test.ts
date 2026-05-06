import { test, expect } from "@playwright/test";
import { getHooks, gotoTest, locateHook, locateTreeItem } from "../../pw-utils";

test("Inspect deep hook tree", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks");

	await devtools.locator(locateTreeItem("CustomHooks3")).click();
	await devtools.locator('[data-testid="Hooks"]').waitFor();

	await devtools
		.locator(
			'[data-testid="Hooks"] [data-testid="props-row"] button[data-collapsed="true"]',
		)
		.first()
		.waitFor();

	const hookCount = async () => (await getHooks(devtools)).length;
	await expect.poll(hookCount).toEqual(2);

	await devtools.locator(locateHook("useBoof")).click();
	await expect.poll(hookCount).toEqual(3);

	await devtools.locator(locateHook("useBob")).click();
	await expect.poll(hookCount).toEqual(4);

	await devtools.locator(locateHook("useFoo")).click();
	await expect.poll(hookCount).toEqual(5);

	await devtools.locator(locateHook("useBar")).click();
	await expect.poll(hookCount).toEqual(7);
});
