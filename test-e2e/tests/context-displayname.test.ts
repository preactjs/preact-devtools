import { expect, test } from "@playwright/test";
import { gotoTest, waitForPass } from "../pw-utils.ts";

test("Inspect should select node in elements panel", async ({ page }) => {
	const { devtools } = await gotoTest(page, "context-displayName");

	await waitForPass(async () => {
		const items = await devtools
			.locator('[data-testid="tree-item"]')
			.allInnerTexts();
		expect(items).toEqual(["App", "Foobar.Provider", "Foobar.Consumer"]);
	});
});
