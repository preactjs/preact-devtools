import { test, expect } from "@playwright/test";
import { clickHookItem, gotoTest, waitForPass } from "../../pw-utils";

test("Show a deeply nested hook tree and limit value parsing depth", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "hooks-depth-limit");

	await devtools.waitForSelector('[data-testid="tree-item"]');

	// State update
	await waitForPass(async () => {
		await devtools.click('[data-name="Hook"]');
		await devtools.waitForSelector('[data-testid="props-row"]');
		const count = await devtools.locator('[data-testid="props-row"]').count();
		expect(count).toBeGreaterThan(0);
	});

	await clickHookItem(devtools, "useBrobba");
	await clickHookItem(devtools, "useBlaBla");
	await clickHookItem(devtools, "useBleb");
	await clickHookItem(devtools, "useBabby");
	await clickHookItem(devtools, "useBubby");
	await clickHookItem(devtools, "useBread");
	await clickHookItem(devtools, "useBlub");
	await clickHookItem(devtools, "useBoof");
	await clickHookItem(devtools, "useBob");
	await clickHookItem(devtools, "useBar");
	await clickHookItem(devtools, "useFoo");

	await clickHookItem(devtools, "useState");
	await clickHookItem(devtools, "key1");
	await clickHookItem(devtools, "key2");
	await clickHookItem(devtools, "key3");
	await clickHookItem(devtools, "key4");
	await clickHookItem(devtools, "key5");
	await clickHookItem(devtools, "key6");
	await clickHookItem(devtools, "key7");

	const text = await devtools
		.locator(
			'form [data-testid="props-row"]:last-child [data-testid="prop-value"]',
		)
		.textContent();
	expect(text).toEqual('"…"');
});
