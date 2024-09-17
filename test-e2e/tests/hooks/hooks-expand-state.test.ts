import { expect, test } from "@playwright/test";
import {
	clickHookItem,
	clickTreeItem,
	getHooks,
	gotoTest,
	locateHook,
} from "../../pw-utils.ts";

test("Inspect useRef hook", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-expand");

	await clickTreeItem(devtools, "Memo");
	await devtools.locator(locateHook("useMemo")).waitFor();

	await clickHookItem(devtools, "useMemo");
	const hooks = await getHooks(devtools);
	expect(hooks.length).toEqual(2);
});
