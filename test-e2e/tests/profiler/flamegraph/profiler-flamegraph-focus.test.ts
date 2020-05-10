import {
	newTestPage,
	click,
	waitForAttribute,
	clickNestedText,
} from "../../../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";
import { Page } from "puppeteer";

async function getFlameNodes(page: Page) {
	return await page.$$eval('[data-type="flamegraph"] > *', els => {
		return els.map(el => {
			const text = el.textContent!;
			return {
				maximized: el.hasAttribute("data-maximized"),
				name: text.slice(0, text.indexOf("(") - 1),
			};
		});
	});
}

export const description = "Focus nodes in flamegraph layout";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-3");

	await click(devtools, '[name="root-panel"][value="PROFILER"]');

	const recordBtn = '[data-testid="record-btn"]';
	await click(devtools, recordBtn);

	await waitForAttribute(devtools, recordBtn, "title", /Stop Recording/);

	await click(page, "button");
	await click(page, "button");

	await click(devtools, recordBtn);

	// Initially only the top node should be focused.
	expect(await getFlameNodes(devtools)).to.deep.equal([
		{ maximized: true, name: "Fragment" },
		{ maximized: false, name: "Foo" },
		{ maximized: false, name: "Counter" },
		{ maximized: false, name: "Display" },
		{ maximized: false, name: "Value" },
	]);

	// Focus 2nd node manually
	await clickNestedText(devtools, "Counter");
	expect(await getFlameNodes(devtools)).to.deep.equal([
		{ maximized: true, name: "Fragment" },
		{ maximized: true, name: "Foo" },
		{ maximized: true, name: "Counter" },
		{ maximized: false, name: "Display" },
		{ maximized: false, name: "Value" },
	]);

	// Focus 1st node again
	await clickNestedText(devtools, "Fragment");
	expect(await getFlameNodes(devtools)).to.deep.equal([
		{ maximized: true, name: "Fragment" },
		{ maximized: false, name: "Foo" },
		{ maximized: false, name: "Counter" },
		{ maximized: false, name: "Display" },
		{ maximized: false, name: "Value" },
	]);

	await closePage(page);
}
