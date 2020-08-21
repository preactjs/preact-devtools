import { newTestPage, installMouseHelper, getText } from "../test-utils";
import { expect } from "chai";

export const description = "Clicking at the right of element names #144";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "deep-tree");
	await installMouseHelper(devtools);

	await page.setViewport({
		width: 1280,
		height: 900,
	});

	const selector = '[data-name="App"]';
	await devtools.waitForSelector(selector);
	const { x, y } = await devtools.evaluate((s: string) => {
		const rect = document.querySelector(s)!.getBoundingClientRect();
		return { x: rect.right, y: rect.top };
	}, selector);
	const offset = await page.evaluate(() => {
		return document.querySelector("#devtools")!.getBoundingClientRect().top;
	});
	await devtools.mouse.click(x - 20, y + offset + 200);

	const text = await getText(devtools, '[data-selected="true"]');
	expect(text).to.equal("ChildItemName");
}
