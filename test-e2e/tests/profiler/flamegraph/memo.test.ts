import { newTestPage, click, waitForAttribute } from "../../../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";
import { Page } from "puppeteer";

async function getFlameNodes(page: Page) {
	return await page.$$eval('[data-type="flamegraph"] > *', els => {
		return els.map(el => {
			const text = el.textContent!;
			return {
				maximized: el.hasAttribute("data-maximized"),
				name: text.slice(0, text.lastIndexOf("(") - 1),
				visible: el.hasAttribute("data-visible"),
			};
		});
	});
}

export const description = "Correctly position memoized sub-trees";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "memo");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');

	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await waitForAttribute(devtools, recordBtn, "title", /Stop Recording/);

	await click(page, "button");
	await click(page, "button");

	await click(devtools, recordBtn);

	const nodes = await getFlameNodes(devtools);
	expect(nodes).to.deep.equal([
		{ maximized: true, name: "Fragment", visible: true },
		{ maximized: false, name: "Counter", visible: true },
		{ maximized: false, name: "Memo(Display)", visible: true },
		{ maximized: false, name: "Display", visible: true },
		{ maximized: false, name: "Value", visible: true },
		{ maximized: false, name: "Value", visible: true },
	]);

	await closePage(page);
}
