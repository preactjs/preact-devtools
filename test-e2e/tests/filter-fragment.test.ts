import { expect, test } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Fragment filter should filter Fragment nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "fragment-filter", {
		preact: "10.4.1",
	});

	await devtools.locator('[data-testid="elements-tree"] [data-name]').waitFor();

	const names = await devtools
		.locator('[data-testid="elements-tree"] [data-name]')
		.allTextContents();

	expect(names).toEqual(["Foo"]);
});
