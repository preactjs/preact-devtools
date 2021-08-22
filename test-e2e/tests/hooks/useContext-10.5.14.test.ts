import { clickAndWaitForHooks, newTestPage } from "../../test-utils";
import { expect } from "chai";
import { clickSelector, waitForSelector, getText } from "pentf/browser_utils";

export const description = "Inspect useContext hook";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "goober", {
		preact: "10.5.14",
	});

	await clickAndWaitForHooks(devtools, "a");

	await clickSelector(
		devtools,
		'[data-testid="Hooks"] [data-depth="1"] button',
	);

	await waitForSelector(devtools, '[data-testid="Hooks"] [data-depth="2"]');

	const name = await getText(
		devtools,
		'[data-testid="Hooks"] [data-depth="2"] [data-testid="prop-name"]',
	);
	const value = await getText(
		devtools,
		'[data-testid="Hooks"] [data-depth="2"] [data-testid="prop-value"]',
	);

	expect(name).to.equal("useContext");
	expect(value).to.equal("undefined");
}
