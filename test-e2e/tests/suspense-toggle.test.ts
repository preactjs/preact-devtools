import { test, expect, Page } from "@playwright/test";
import {
	getTreeViewItemNames,
	gotoTest,
	locateTreeItem,
	waitFor,
} from "../pw-utils";

function testCase(preactVersion: string) {
	return async ({ page }: { page: Page }) => {
		const { devtools } = await gotoTest(page, "suspense", {
			preact: preactVersion,
		});

		await devtools.click(locateTreeItem("Delayed"));
		await devtools.click('[data-testid="suspend-action"]');

		await waitFor(async () => {
			const items = await getTreeViewItemNames(devtools);
			expect(items).toEqual(
				[
					"Shortly",
					"Block",
					"Suspense",
					// <10.4.5, newer versions use a Fragment
					preactVersion === "10.4.1" && "Component",
					"Block",
				].filter(Boolean),
			);
			return true;
		});

		const selected = await devtools
			.locator('[data-testid="tree-item"][data-selected="true"]')
			.getAttribute("data-name");

		expect(selected).toEqual("Suspense");

		await devtools.click(locateTreeItem("Shortly"));

		await devtools
			.locator('[data-testid="inspect-component-name"]:has-text("<Shortly>")')
			.textContent();

		await expect(
			devtools.locator('[data-testid="suspend-action"]'),
		).toHaveCount(0);
	};
}

test.describe("Display Suspense in tree view", () => {
	test("Preact 10.5.9", testCase("10.5.9"));
	test("Preact 10.4.1", testCase("10.4.1"));
});
