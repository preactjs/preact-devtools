import { newTestPage, getText$$ } from "../test-utils";
import { expect } from "chai";
import { waitFor } from "pentf/assert_utils";
import { waitForSelector } from "pentf/browser_utils";

export const description = "Mirror component state to the devtools";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "iframe");

	let elements: string[] = [];
	await waitFor(async () => {
		const found = await getText$$(devtools, '[data-testid="tree-item"]');
		if (found.length === 6) {
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

	const frames = await page.frames();
	const iframe1 = frames.find(frame => frame.url().endsWith("iframe.html"));
	await waitForSelector(iframe1 as any, highlight, { timeout: 2000 });

	// Foobar.Consumer
	await devtools.hover('[data-name="Foobar.Consumer"]');
	const iframe2 = frames.find(frame => frame.url().endsWith("iframe.html"));
	await waitForSelector(iframe2 as any, highlight);
}
