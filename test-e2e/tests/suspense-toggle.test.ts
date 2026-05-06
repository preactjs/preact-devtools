import { test, expect, Page } from "@playwright/test";
import { getTreeViewItemNames, gotoTest, locateTreeItem } from "../pw-utils";

function testCase(preactVersion: string) {
	return async ({ page }: { page: Page }) => {
		const { devtools } = await gotoTest(page, "suspense", {
			preact: preactVersion,
		});

		await devtools.locator(locateTreeItem("Delayed")).click();
		await devtools.locator('[data-testid="suspend-action"]').click();

		await expect
			.poll(() => getTreeViewItemNames(devtools))
			.toEqual(
				[
					"Shortly",
					"Block",
					"Suspense",
					// <10.4.5, newer versions use a Fragment
					preactVersion === "10.4.1" && "Component",
					"Block",
				].filter(Boolean),
			);

		await expect(
			devtools.locator('[data-testid="tree-item"][data-selected="true"]'),
		).toHaveAttribute("data-name", "Suspense");

		await devtools.locator(locateTreeItem("Shortly")).click();

		await devtools
			.locator('[data-testid="inspect-component-name"]:has-text("<Shortly>")')
			.waitFor();

		await expect(
			devtools.locator('[data-testid="suspend-action"]'),
		).toHaveCount(0);
	};
}

test.describe("Display Suspense in tree view", () => {
	test("Preact 10.5.9", testCase("10.5.9"));
	test("Preact 10.4.1", testCase("10.4.1"));
});
