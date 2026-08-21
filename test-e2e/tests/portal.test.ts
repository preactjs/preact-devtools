import { expect, test } from "@playwright/test";
import { gotoTest, locateTreeItem } from "../pw-utils";

test("Display core portals in the component tree", async ({ page }) => {
	test.skip(
		!/^(?:11(?:\.|$)|git$)/.test(process.env.PREACT_VERSION || ""),
		"Core portals are supported in Preact 11.",
	);

	const { devtools } = await gotoTest(page, "portal");

	await expect(page.locator('[data-testid="portal-content"]')).toHaveText(
		"Portal content",
	);
	await expect(devtools.locator(locateTreeItem("Portal"))).toHaveCount(1);
	await expect(devtools.locator(locateTreeItem("Modal"))).toHaveCount(1);
});
