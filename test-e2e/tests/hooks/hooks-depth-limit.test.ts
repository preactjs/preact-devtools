import { test, expect } from "@playwright/test";
import { clickHookItem, gotoTest } from "../../pw-utils";

test("Show a deeply nested hook tree and limit value parsing depth", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "hooks-depth-limit");

	await devtools.locator('[data-testid="tree-item"]').first().waitFor();

	await devtools.locator('[data-name="Hook"]').click();
	await expect
		.poll(() => devtools.locator('[data-testid="props-row"]').count())
		.toBeGreaterThan(0);

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

	await expect(
		devtools.locator(
			'form [data-testid="props-row"]:last-child [data-testid="prop-value"]',
		),
	).toHaveText('"…"');
});
