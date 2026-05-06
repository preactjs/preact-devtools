import { test, expect } from "@playwright/test";
import {
	clickHookItem,
	clickTreeItem,
	getHooks,
	gotoTest,
	locateHook,
} from "../../pw-utils";

test("Inspect useRef hook", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-expand");

	await clickTreeItem(devtools, "Memo");
	await devtools.locator(locateHook("useMemo")).waitFor();

	await clickHookItem(devtools, "useMemo");
	await expect.poll(async () => (await getHooks(devtools)).length).toEqual(2);
});
