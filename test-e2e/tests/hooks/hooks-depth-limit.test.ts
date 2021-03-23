import { clickAndWaitForHooks, newTestPage } from "../../test-utils";
import { waitForTestId, getText, clickNestedText } from "pentf/browser_utils";
import { expect } from "chai";

export const description =
	"Show a deeply nested hook tree and limit value parsing depth";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-depth-limit");

	await waitForTestId(devtools, "tree-item");

	// State update
	await clickAndWaitForHooks(devtools, "Hook");

	await clickNestedText(devtools, "useBrobba");
	await clickNestedText(devtools, "useBlaBla");
	await clickNestedText(devtools, "useBleb");
	await clickNestedText(devtools, "useBabby");
	await clickNestedText(devtools, "useBubby");
	await clickNestedText(devtools, "useBread");
	await clickNestedText(devtools, "useBlub");
	await clickNestedText(devtools, "useBoof");
	await clickNestedText(devtools, "useBob");
	await clickNestedText(devtools, "useBar");
	await clickNestedText(devtools, "useFoo");

	// Native hooks
	await clickNestedText(devtools, "useState");
	await clickNestedText(devtools, /^key1/);
	await clickNestedText(devtools, /^key2/);
	await clickNestedText(devtools, /^key3/);
	await clickNestedText(devtools, /^key4/);
	await clickNestedText(devtools, /^key5/);
	await clickNestedText(devtools, /^key6/);
	await clickNestedText(devtools, /^key7/);

	const text = await getText(
		devtools,
		'form [data-testid="props-row"]:last-child [data-testid="prop-value"]',
	);
	expect(text).to.equal('"…"');
}
