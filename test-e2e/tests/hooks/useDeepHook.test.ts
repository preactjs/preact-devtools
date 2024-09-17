import { expect, test } from "@playwright/test";
import {
	getHooks,
	gotoTest,
	locateHook,
	locateTreeItem,
} from "../../pw-utils.ts";

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

	let hooks = await getHooks(devtools);
	expect(hooks.length).toEqual(2);

	await devtools.locator(locateHook("useBoof")).click();
	hooks = await getHooks(devtools);
	expect(hooks.length).toEqual(3);

	await devtools.locator(locateHook("useBob")).click();
	hooks = await getHooks(devtools);
	expect(hooks.length).toEqual(4);

	await devtools.locator(locateHook("useFoo")).click();
	hooks = await getHooks(devtools);
	expect(hooks.length).toEqual(5);

	await devtools.locator(locateHook("useBar")).click();
	hooks = await getHooks(devtools);
	expect(hooks.length).toEqual(7);
});
