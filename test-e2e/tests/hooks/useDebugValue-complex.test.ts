import { newTestPage, clickAndWaitForHooks } from "../../test-utils";
import { expect } from "chai";
import { getText } from "pentf/browser_utils";

export const description = "Show custom debug value";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-debug");

	// State update
	await clickAndWaitForHooks(devtools, "App");

	const name = await getText(devtools, '[data-testid="prop-name"]');
	const value = await getText(devtools, '[data-testid="prop-value"]');

	expect(name).to.equal("useFoo");
	expect(value).to.equal('{foo: "bar"}');
}
