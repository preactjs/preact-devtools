import { expect, test } from "@playwright/test";
import { getTreeItems, gotoTest } from "../pw-utils.ts";

test("Islands roots should be sorted by DOM order", async ({ page }) => {
	const { devtools } = await gotoTest(page, "islands-order");

	const items = await getTreeItems(devtools);
	expect(items.map((x) => x.name)).toEqual(["App1", "App2", "App3"]);
});

test("Virtual island roots should be sorted by DOM order", async ({ page }) => {
	test.skip(
		process.env.PREACT_VERSION !== "10",
		"Fake root DOM node is not supported in v11",
	);
	const { devtools } = await gotoTest(page, "islands-order-virtual");

	const items = await getTreeItems(devtools);
	expect(items.map((x) => x.name)).toEqual([
		"App1",
		"App2",
		"Virtual1",
		"Virtual2",
		"App3",
	]);
});
