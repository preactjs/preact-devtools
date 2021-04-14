import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
} from "../../../test-utils";
import { expect } from "chai";
import { Page } from "puppeteer";
import { clickNestedText, getAttribute } from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

async function getFlameNodes(page: Page) {
	return await page.$$eval('[data-type="ranked"] > *', els => {
		return els.map(el => {
			const text = el.textContent!;
			return {
				maximized: el.hasAttribute("data-maximized"),
				name: text.slice(0, text.indexOf("(") - 1),
			};
		});
	});
}

export const description = "Focus nodes in ranked layout";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-3");

	await clickTab(devtools, "PROFILER");
	await waitForPass(async () => {
		await click(devtools, '[name="flamegraph_mode"][value="RANKED"]');

		expect(
			await getAttribute(
				devtools,
				'[name="flamegraph_mode"][value="RANKED"]',
				"checked",
			),
		).to.equal(true);
	});

	await waitForPass(async () => {
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
		await clickNestedText(devtools, "Display");
		expect(await getFlameNodes(devtools)).to.deep.equal([
			{ maximized: true, name: "Counter" },
			{ maximized: true, name: "Display" },
			{ maximized: false, name: "Value" },
		]);

		// Focus 1st node again
		await clickNestedText(devtools, "Counter");
		expect(await getFlameNodes(devtools)).to.deep.equal([
			{ maximized: true, name: "Counter" },
			{ maximized: false, name: "Display" },
			{ maximized: false, name: "Value" },
		]);
	});
}
