import { expect, test } from "@playwright/test";
import { getTreeViewItemNames, gotoTest } from "../pw-utils";

test("Display core portals in the component tree", async ({ page }) => {
	test.skip(
		!/^(?:11(?:\.|$)|git$)/.test(process.env.PREACT_VERSION || ""),
		"Core portals are supported in Preact 11.",
	);

	const { devtools } = await gotoTest(page, "portal");

	await expect(page.locator('[data-testid="portal-content"]')).toHaveText(
		"Portal content",
	);
	await expect
		.poll(() => getTreeViewItemNames(devtools))
		.toEqual(["App", "Portal", "Modal"]);
});
