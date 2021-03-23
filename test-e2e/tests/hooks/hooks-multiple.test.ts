import { clickAndWaitForHooks, newTestPage } from "../../test-utils";
import { waitForTestId } from "pentf/browser_utils";
import { expect } from "chai";

export const description =
	"Show upgrade warning when Preact version is too old";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-multiple");

	// State update
	await clickAndWaitForHooks(devtools, "App");

	await waitForTestId(devtools, "Hooks");

	const hooks = await devtools.evaluate(() => {
		const items = Array.from(
			document.querySelectorAll(
				'[data-testid="Hooks"] [data-testid="prop-name"]',
			),
		);
		return items.map(item => item.textContent);
	});

	expect(hooks).to.deep.equal([
		"useState",
		"useState",
		"useState",
		"useCallback",
		"useMemo",
	]);
}
