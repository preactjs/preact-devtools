import { newTestPage } from "../../test-utils";
import { clickNestedText, waitForTestId } from "pentf/browser_utils";
import { expect } from "chai";

export const description =
	"Show upgrade warning when Preact version is too old";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-multiple");

	// State update
	await clickNestedText(devtools, "App", {
		retryUntil: async () => {
			return await devtools.evaluate(
				() => document.querySelector('[data-testid="Hooks"]') !== null,
			);
		},
	});

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
