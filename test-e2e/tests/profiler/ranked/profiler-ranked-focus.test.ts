import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
} from "../../../test-utils";
import { expect } from "chai";
import { Page } from "puppeteer";
import { clickSelector } from "pentf/browser_utils";

async function getFlameNodes(page: Page) {
	return await page.$$eval('[data-type="ranked"] > *', els => {
		return els.map(el => {
			return {
				maximized: el.hasAttribute("data-maximized"),
				name: el.getAttribute("data-name"),
			};
		});
	});
}

export const description = "Focus nodes in ranked layout";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-3");

	await clickTab(devtools, "PROFILER");
	await click(devtools, '[name="flamegraph_mode"][value="RANKED"]');

	await clickRecordButton(devtools);

	await click(page, "button");
	await click(page, "button");

	await clickRecordButton(devtools);

	// Initially only the top node should be focused.
	expect(await getFlameNodes(devtools)).to.deep.equal([
		{ maximized: true, name: "Counter" },
		{ maximized: false, name: "Display" },
		{ maximized: false, name: "Value" },
	]);

	// Focus 2nd node manually
	await clickSelector(devtools, '[data-type="ranked"] [data-name="Display"]');
	expect(await getFlameNodes(devtools)).to.deep.equal([
		{ maximized: true, name: "Counter" },
		{ maximized: true, name: "Display" },
		{ maximized: false, name: "Value" },
	]);

	// Focus 1st node again
	await clickSelector(devtools, '[data-type="ranked"] [data-name="Counter"]');
	expect(await getFlameNodes(devtools)).to.deep.equal([
		{ maximized: true, name: "Counter" },
		{ maximized: false, name: "Display" },
		{ maximized: false, name: "Value" },
	]);
}
