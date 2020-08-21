import { newTestPage, getText$$, getSize } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";

export const description = "Mirror component state to the devtools";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "iframe", {
		preact: "next",
	});

	const elements = await getText$$(devtools, '[data-testid="tree-item"]');
	expect(elements).to.deep.equal([
		"View",
		"Counter",
		"Display",
		"App",
		"Foobar.Provider",
		"Foobar.Consumer",
	]);

	const highlight = '[data-testid="highlight"]';

	// Display
	await devtools.hover('[data-name="Display"]');
	await page.waitForSelector(highlight, {
		timeout: 2000,
	});

	await wait(100);

	let size = await getSize(page, highlight);
	let iframeSize = await getSize(page, 'iframe[src="/iframe.html"]');

	expect(size.top > iframeSize.top).to.equal(true, "top");
	expect(size.left > iframeSize.left).to.equal(true, "left");
	expect(size.right < iframeSize.right).to.equal(true, "right");
	expect(size.bottom < iframeSize.bottom).to.equal(true, "bottom");

	// Foobar.Consumer
	await devtools.hover('[data-name="Foobar.Consumer"]');
	await page.waitForSelector(highlight, {
		timeout: 2000,
	});

	await wait(100);

	size = await getSize(page, highlight);
	iframeSize = await getSize(page, 'iframe[src="/iframe2.html"]');

	expect(size.top > iframeSize.top).to.equal(true, "top");
	expect(size.left > iframeSize.left).to.equal(true, "left");
	expect(size.right < iframeSize.right).to.equal(true, "right");
	expect(size.bottom < iframeSize.bottom).to.equal(true, "bottom");
}
