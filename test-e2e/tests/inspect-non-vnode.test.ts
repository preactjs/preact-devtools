import { newTestPage, click, getText } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pintf/browser_utils";

export const description = "Inspect should only parse vnodes as vnodes #114";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "non-vnode");

	await click(devtools, '[data-testid="tree-item"]');
	await devtools.waitForSelector('[name="new-prop-name"]');

	const values = await devtools.evaluate(() => {
		const el = Array.from(
			document.querySelectorAll('[data-testid="props-row"] [data-type]'),
		);
		return el.map(x => x.getAttribute("data-type"));
	});

	expect(values).to.deep.equal(["blob", "object", "vnode", "vnode"]);

	const blob = await getText(
		devtools,
		'[data-testid="props-row"]:first-child [data-testid="prop-value"]',
	);
	expect(blob).to.equal("Blob {}");

	await closePage(page);
}
