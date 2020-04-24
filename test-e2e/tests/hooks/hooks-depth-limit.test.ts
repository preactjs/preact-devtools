import { newTestPage, clickNestedText } from "../../test-utils";
import { closePage, waitForTestId, getText } from "pentf/browser_utils";
import { expect } from "chai";

export const description =
	"Show a deeply nested hook tree and limit value parsing depth";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hooks-depth-limit", {
		preact: "hook",
	});

	await waitForTestId(devtools, "tree-item");

	// State update
	await clickNestedText(devtools, "Hook", {
		timeout: 4000,
	});
	await devtools.waitForSelector('[data-testid="props-row"]', {
		timeout: 2000,
	});

	const options = { timeout: 2000 };

	await clickNestedText(devtools, "useBrobba", options);
	await clickNestedText(devtools, "useBlaBla", options);
	await clickNestedText(devtools, "useBleb", options);
	await clickNestedText(devtools, "useBabby", options);
	await clickNestedText(devtools, "useBubby", options);
	await clickNestedText(devtools, "useBread", options);
	await clickNestedText(devtools, "useBlub", options);
	await clickNestedText(devtools, "useBoof", options);
	await clickNestedText(devtools, "useBob", options);
	await clickNestedText(devtools, "useBar", options);
	await clickNestedText(devtools, "useFoo", options);

	// Native hooks
	await clickNestedText(devtools, "useState", options);
	await clickNestedText(devtools, /^key1/, options);
	await clickNestedText(devtools, /^key2/, options);
	await clickNestedText(devtools, /^key3/, options);
	await clickNestedText(devtools, /^key4/, options);
	await clickNestedText(devtools, /^key5/, options);
	await clickNestedText(devtools, /^key6/, options);
	await clickNestedText(devtools, /^key7/, options);

	const text = await getText(
		devtools,
		'form [data-testid="props-row"]:last-child [data-testid="prop-value"]',
	);
	expect(text).to.equal('"…"');

	await closePage(page);
}
