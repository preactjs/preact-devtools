import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Inspect should only parse vnodes as vnodes #114", async ({ page }) => {
	const { devtools } = await gotoTest(page, "non-vnode");

	await devtools.locator('[data-testid="tree-item"]').click();
	await devtools.locator('[name="new-prop-name"]').waitFor();

	await expect
		.poll(() =>
			devtools
				.locator('[data-testid="Props"] [data-testid="props-row"] [data-type]')
				.evaluateAll(els => els.map(el => el.getAttribute("data-type"))),
		)
		.toEqual(["blob", "object", "vnode", "vnode"]);

	await expect(
		devtools.locator(
			'[data-testid="props-row"]:first-child [data-testid="prop-value"]',
		),
	).toHaveText("Blob {}");
});
