import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("HOC-Component filter should flatten tree", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc");

	await devtools
		.locator('[data-testid="tree-item"][data-name="Foo"]')
		.first()
		.waitFor();

	await expect
		.poll(() =>
			devtools
				.locator('[data-testid="tree-item"]')
				.evaluateAll(els => els.map(el => el.getAttribute("data-name"))),
		)
		.toEqual(["Foo", "Bar", "Anonymous", "Foo", "Last"]);

	await devtools.locator('[data-name="Anonymous"]').click();

	await expect(
		devtools.locator('[data-testid="hoc-panel"] .hoc-item'),
	).toHaveText(["ForwardRef"]);

	await devtools.locator('[data-name="Last"]').click();

	await expect(
		devtools.locator('[data-testid="hoc-panel"] .hoc-item'),
	).toHaveText(["withBoof", "Memo"]);
});
