import { test, expect } from "@playwright/test";
import { getTreeItems, gotoTest } from "../pw-utils";

test("Islands roots should be sorted by DOM order", async ({ page }) => {
	const { devtools } = await gotoTest(page, "islands-order");

	const items = await getTreeItems(devtools);
	expect(items.map(x => x.name)).toEqual(["App1", "App2", "App3"]);
});

test("Virtual island roots should be sorted by DOM order", async ({ page }) => {
	const { devtools } = await gotoTest(page, "islands-order-virtual");

	const items = await getTreeItems(devtools);
	expect(items.map(x => x.name)).toEqual([
		"App1",
		"App2",
		"Virtual1",
		"Virtual2",
		"App3",
	]);
});
