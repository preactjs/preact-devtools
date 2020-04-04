import { newTestPage, click, getLog, getText } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pintf/browser_utils";
import { wait } from "pintf/utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter", {
		preact: "hook",
	});

	const inspect = '[data-testid="inspect-btn"]';
	await click(devtools, inspect);

	const target = "button";
	await page.hover(target);

	// Wait for possible flickering to occur
	await wait(1000);

	await page.click(target);

	// Wait for possible flickering to occur
	await wait(1000);

	const log = await getLog(page);
	expect(log.filter(x => x.type === "start-picker").length).to.equal(1);
	expect(log.filter(x => x.type === "stop-picker").length).to.equal(1);

	const text = await getText(devtools, '[data-selected="true"]');
	expect(text).to.equal("Display");
	// await closePage(page);
}
