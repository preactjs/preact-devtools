import { enableHOCFilter, newTestPage, waitForSelector } from "../test-utils";
import { expect } from "chai";
import { Page } from "puppeteer";

async function getTreeItems(page: Page) {
	return await page.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map(el => {
			return {
				name: el.getAttribute("data-name"),
				hocs: Array.from(el.querySelectorAll(".hoc-item")).map(
					h => h.textContent,
				),
			};
		});
	});
}

export const description = "HOC-Component should work with updates";
export async function run(config: any) {
	const { devtools, page } = await newTestPage(config, "hoc-update");

	await enableHOCFilter(devtools);
	await waitForSelector(
		devtools,
		'[data-testid="tree-item"][data-name="Wrapped"]',
	);

	let items = await getTreeItems(devtools);
	expect(items).to.deep.equal([
		{ name: "Wrapped", hocs: ["withBoof"] },
		{ name: "Bar", hocs: ["ForwardRef"] },
	]);

	// Trigger update
	await page.click("button");

	items = await getTreeItems(devtools);
	expect(items).to.deep.equal([
		{ name: "Wrapped", hocs: ["withBoof"] },
		{ name: "Foo", hocs: ["Memo"] },
	]);
}
