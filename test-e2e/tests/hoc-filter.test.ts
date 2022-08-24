import { test, expect } from "@playwright/test";
import { gotoTest, waitForPass } from "../pw-utils";

test("HOC-Component filter should flatten tree", async ({ page }) => {
	const { devtools } = await gotoTest(page, "hoc");

	await devtools.waitForSelector('[data-testid="tree-item"][data-name="Foo"]');

	const items = await devtools
		.locator('[data-testid="tree-item"]')
		.evaluateAll(els => els.map(el => el.getAttribute("data-name")));

	expect(items).toEqual(["Foo", "Bar", "Anonymous", "Foo", "Last"]);

	await devtools.click('[data-name="Anonymous"]');

	const hocs = await devtools
		.locator('[data-testid="hoc-panel"] .hoc-item')
		.allInnerTexts();
	expect(hocs).toEqual(["ForwardRef"]);

	await devtools.click('[data-name="Last"]');

	await waitForPass(async () => {
		const hocs = await devtools
			.locator('[data-testid="hoc-panel"] .hoc-item')
			.allInnerTexts();
		expect(hocs).toEqual(["withBoof", "Memo"]);
	});
});
