import { test, expect, Page } from "@playwright/test";
import { getTreeViewItemNames, gotoTest, waitForPass } from "../pw-utils";

function testCase(version: string) {
	return async ({ page }: { page: Page }) => {
		const { devtools } = await gotoTest(page, "suspense", {
			preact: version,
		});

		await devtools.waitForSelector('[data-testid="tree-item"]');

		await waitForPass(async () => {
			const items = await getTreeViewItemNames(devtools);
			expect(items).toEqual(
				[
					"Shortly",
					"Block",
					"Suspense",
					version === "10.4.1" && "Component",
					"Block",
				].filter(Boolean),
			);
		});

		await waitForPass(async () => {
			const items = await getTreeViewItemNames(devtools);
			expect(items).toEqual(
				[
					"Shortly",
					"Block",
					"Suspense",
					version === "10.4.1" && "Component",
					"Delayed",
					"Block",
				].filter(Boolean),
			);
		});
	};
}

test.describe("Display Suspense in tree view", () => {
	test("Preact 10.5.9", testCase("10.5.9"));

	// <10.4.5, uses a component instead of a Fragment as the boundary
	test("Preact 10.4.1", testCase("10.4.1"));
});
