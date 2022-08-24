import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Inspect should only parse vnodes as vnodes #114", async ({ page }) => {
	const { devtools } = await gotoTest(page, "non-vnode");

	await devtools.click('[data-testid="tree-item"]');
	await devtools.waitForSelector('[name="new-prop-name"]');

	const values = await devtools
		.locator('[data-testid="Props"] [data-testid="props-row"] [data-type]')
		.evaluateAll(els => els.map(el => el.getAttribute("data-type")));

	expect(values).toEqual(["blob", "object", "vnode", "vnode"]);

	const blob = await devtools
		.locator('[data-testid="props-row"]:first-child [data-testid="prop-value"]')
		.textContent();
	expect(blob).toEqual("Blob {}");
});
