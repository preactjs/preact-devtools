import { expect, test } from "@playwright/test";
import {
	clickRecordButton,
	gotoTest,
	locateFlame,
	locateTab,
} from "../../../pw-utils.ts";

test("Not rendered nodes that are not parents of the current commit should be striped out", async ({ page }) => {
	const { devtools } = await gotoTest(page, "profiler-2");

	await devtools.locator(locateTab("PROFILER")).click();
	await clickRecordButton(devtools);
	await page.locator("button").first().click();
	await clickRecordButton(devtools);

	await devtools.locator(locateFlame("Counter")).first().waitFor();

	let nodes = await devtools
		.locator(
			'[data-type="flamegraph"] [data-testid="flame-node"]:not([data-weight="-1"])',
		)
		.allTextContents();
	expect(nodes.map((n) => n.split(" ")[0])).toEqual(["Counter", "Display"]);
	nodes = await devtools
		.locator('[data-type="flamegraph"] [data-commit-parent]')
		.allTextContents();
	expect(nodes.map((n) => n.split(" ")[0])).toEqual(["Fragment", "App"]);
});
