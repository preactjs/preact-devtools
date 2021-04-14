import { newTestPage, getText$$, getSize } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";
import { waitFor } from "pentf/assert_utils";

export const description = "Mirror component state to the devtools";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "iframe");

	let elements: string[] = [];
	await waitFor(async () => {
		const found = await getText$$(devtools, '[data-testid="tree-item"]');
		if (found.length > 0) {
			elements = found;
			return true;
		}

		return false;
	});

	// Ordering is timing sensitive due to iframe loading. We just need
	// to check that both were loaded, so the order doesn't matter.
	expect(elements[0]).to.equal("View");

	if (elements[1] === "Counter") {
		expect(elements.slice(1, 3)).to.deep.equal(["Counter", "Display"]);
		expect(elements.slice(3)).to.deep.equal([
			"App",
			"Foobar.Provider",
			"Foobar.Consumer",
		]);
	} else {
		expect(elements.slice(1, 4)).to.deep.equal([
			"App",
			"Foobar.Provider",
			"Foobar.Consumer",
		]);
		expect(elements.slice(4)).to.deep.equal(["Counter", "Display"]);
	}

	const highlight = '[data-testid="highlight"]';

	// Display
	await devtools.hover('[data-name="Display"]');
	await page.waitForSelector(highlight);

	await wait(100);

	let size = await getSize(page, highlight);
	let iframeSize = await getSize(page, 'iframe[src="/iframe.html"]');

	expect(size.top > iframeSize.top).to.equal(true, "top");
	expect(size.left > iframeSize.left).to.equal(true, "left");
	expect(size.right < iframeSize.right).to.equal(true, "right");
	expect(size.bottom < iframeSize.bottom).to.equal(true, "bottom");

	// Foobar.Consumer
	await devtools.hover('[data-name="Foobar.Consumer"]');
	await page.waitForSelector(highlight);

	await wait(100);

	size = await getSize(page, highlight);
	iframeSize = await getSize(page, 'iframe[src="/iframe2.html"]');

	expect(size.top > iframeSize.top).to.equal(true, "top");
	expect(size.left > iframeSize.left).to.equal(true, "left");
	expect(size.right < iframeSize.right).to.equal(true, "right");
	expect(size.bottom < iframeSize.bottom).to.equal(true, "bottom");
}
