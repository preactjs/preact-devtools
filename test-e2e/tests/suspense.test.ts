import { test, expect, Page } from "@playwright/test";
import { getTreeViewItemNames, gotoTest } from "../pw-utils";

function testCase(version: string) {
	return async ({ page }: { page: Page }) => {
		const { devtools } = await gotoTest(page, "suspense", {
			preact: version,
		});

		await devtools.locator('[data-testid="tree-item"]').first().waitFor();

		await expect
			.poll(() => getTreeViewItemNames(devtools))
			.toEqual(
				[
					"Shortly",
					"Block",
					"Suspense",
					version === "10.4.1" && "Component",
					"Block",
				].filter(Boolean),
			);

		await expect
			.poll(() => getTreeViewItemNames(devtools))
			.toEqual(
				[
					"Shortly",
					"Block",
					"Suspense",
					version === "10.4.1" && "Component",
					"Delayed",
					"Block",
				].filter(Boolean),
			);
	};
}

test.describe("Display Suspense in tree view", () => {
	test("Preact 10.5.9", testCase("10.5.9"));

	// <10.4.5, uses a component instead of a Fragment as the boundary
	test("Preact 10.4.1", testCase("10.4.1"));
});
