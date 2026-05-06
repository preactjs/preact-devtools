import { test, expect } from "@playwright/test";
import { clickTreeItem, getHooks, gotoTest } from "../../pw-utils";

test("Show custom hook name", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-name");

	// Counter
	await clickTreeItem(devtools, "Counter");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useState customState", "0"]]);

	// Callback (Mixed)
	await clickTreeItem(devtools, "CounterCallback");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([
			["useState counterState", "0"],
			["useCallback", "ƒ ()"],
		]);

	// Reducer
	await clickTreeItem(devtools, "ReducerComponent");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useReducer customReducer", '"foo"']]);

	// Ref
	await clickTreeItem(devtools, "RefComponent");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useRef customRef", "0"]]);

	// useMemo
	await clickTreeItem(devtools, "MemoComponent");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useMemo customMemo", "0"]]);

	// Multiple (test ordering)
	await clickTreeItem(devtools, "Multiple");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([
			["useState foo", "0"],
			["useState bar", "0"],
			["useState baz", "0"],
		]);

	// Do nothing for invalid callsites
	await clickTreeItem(devtools, "CallbackOnly");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useCallback", "ƒ ()"]]);

	await clickTreeItem(devtools, "LayoutEffect");
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([["useLayoutEffect", "ƒ ()"]]);

	await clickTreeItem(devtools, "Effect");
	await expect.poll(() => getHooks(devtools)).toEqual([["useEffect", "ƒ ()"]]);
});

test("Skip custom hook name for user hook", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hooks-name-custom");

	await clickTreeItem(devtools, "App");
	await devtools
		.locator('[data-testid="prop-name"]:has-text("useFoo")')
		.click();
	await expect
		.poll(() => getHooks(devtools))
		.toEqual([
			["useFoo", ""],
			["useMemo a", '"a"'],
			["useMemo b", '"b"'],
		]);
});
