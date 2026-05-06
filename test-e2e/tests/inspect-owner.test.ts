import { test, expect } from "@playwright/test";
import { getOwners, gotoTest, locateTreeItem } from "../pw-utils";

test("Inspect owner information", async ({ page }) => {
	const { devtools } = await gotoTest(page, "update-all");

	await devtools.locator(locateTreeItem("App")).click();
	await expect.poll(() => getOwners(devtools)).toEqual([]);

	await devtools.locator(locateTreeItem("Props")).click();
	await expect.poll(() => getOwners(devtools)).toEqual(["App"]);

	await devtools.locator(locateTreeItem("State")).click();
	await expect.poll(() => getOwners(devtools)).toEqual(["App"]);

	await devtools.locator(locateTreeItem("Context")).click();
	await expect.poll(() => getOwners(devtools)).toEqual(["App"]);

	await devtools.locator(locateTreeItem("Provider")).click();
	await expect.poll(() => getOwners(devtools)).toEqual(["Context", "App"]);

	await devtools.locator(locateTreeItem("Consumer")).click();
	await expect.poll(() => getOwners(devtools)).toEqual(["Context", "App"]);

	await devtools.locator(locateTreeItem("LegacyContext")).click();
	await expect.poll(() => getOwners(devtools)).toEqual(["App"]);

	await devtools.locator(locateTreeItem("LegacyConsumer")).click();
	await expect
		.poll(() => getOwners(devtools))
		.toEqual(["LegacyContext", "App"]);
});
