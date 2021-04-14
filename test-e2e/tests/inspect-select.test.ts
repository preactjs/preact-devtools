import { newTestPage, getLog, getSize } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";
import { clickSelector, getAttribute } from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

export const description = "Should inspect during picking";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	const elem1 = '[data-testid="tree-item"][data-name="Counter"]';
	const prop = '[data-testid="Props"] [data-testid="props-row"]';
	await clickSelector(devtools, elem1);
	await waitForPass(async () => {
		expect((await devtools.$$(prop)).length).to.equal(0);
	});

	const target = '[data-testid="result"]';
	const inspect = '[data-testid="inspect-btn"]';

	await clickSelector(devtools, inspect);
	let active = await getAttribute(devtools, inspect, "data-active");
	expect(active).to.equal("true");

	await page.hover(target);
	await wait(100);

	// Move mouse slightly
	const rect = await getSize(page, target);
	await page.mouse.move(rect.x, rect.y);
	await wait(500);

	// Should load prop data
	expect((await devtools.$$(prop)).length).to.equal(1);

	// Should only fire inspect event once per id
	const inspects = (await getLog(page)).filter(
		x => x.type === "inspect-result",
	);
	expect(inspects.length).to.equal(2);

	// Should select new node in element tree
	await page.click(target);
	await wait(500);
	active = await getAttribute(devtools, inspect, "data-active");
	expect(active).to.equal(null);

	// ...and display the newly inspected data
	expect((await devtools.$$(prop)).length).to.equal(1);
}
