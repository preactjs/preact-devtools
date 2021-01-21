import { newTestPage, getHooks } from "../../test-utils";
import { expect } from "chai";
import { clickNestedText } from "pentf/browser_utils";

export const description = "Show custom hook name";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-name", {
		preact: "use-debug-name",
	});

	const hooksPanel = '[data-testid="props-row"]';

	// Counter
	await clickNestedText(devtools, /Counter$/, {
		retryUntil: async () => {
			return !!(await devtools.$('[data-testid="Hooks"]'));
		},
	});
	await devtools.waitForSelector(hooksPanel);

	expect(await getHooks(devtools)).to.deep.equal([["customState", "0"]]);

	// Callback (Mixed)
	await clickNestedText(devtools, /CounterCallback$/);
	await devtools.waitForSelector(hooksPanel);
	expect(await getHooks(devtools)).to.deep.equal([
		["counterState", "0"],
		["useCallback", "ƒ ()"],
	]);

	// Reducer
	await clickNestedText(devtools, /ReducerComponent$/);
	await devtools.waitForSelector(hooksPanel);
	expect(await getHooks(devtools)).to.deep.equal([["customReducer", '"foo"']]);

	// Ref
	await clickNestedText(devtools, /RefComponent$/);
	await devtools.waitForSelector(hooksPanel);
	expect(await getHooks(devtools)).to.deep.equal([["customRef", "0"]]);

	// Do nothing for invalid callsites
	await clickNestedText(devtools, /CallbackOnly$/);
	await devtools.waitForSelector(hooksPanel);
	expect(await getHooks(devtools)).to.deep.equal([["useCallback", "ƒ ()"]]);

	await clickNestedText(devtools, /LayoutEffect$/);
	await devtools.waitForSelector(hooksPanel);
	expect(await getHooks(devtools)).to.deep.equal([["useLayoutEffect", "ƒ ()"]]);

	await clickNestedText(devtools, /^Effect$/);
	await devtools.waitForSelector(hooksPanel);
	expect(await getHooks(devtools)).to.deep.equal([["useEffect", "ƒ ()"]]);
}
