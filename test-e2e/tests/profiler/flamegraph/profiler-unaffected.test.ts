import { test, expect } from "@playwright/test";
import {
	clickRecordButton,
	locateTab,
	gotoTest,
	locateFlame,
} from "../../../pw-utils";

test("Not rendered nodes that are not parents of the current commit should be striped out", async ({
	page,
}) => {
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
	expect(nodes.map(n => n.split(" ")[0])).toEqual(["Counter", "Display"]);
	nodes = await devtools
		.locator('[data-type="flamegraph"] [data-commit-parent="true"]')
		.allTextContents();
	expect(nodes.map(n => n.split(" ")[0])).toEqual(["Fragment", "App"]);
});
