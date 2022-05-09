import { newTestPage, waitForSelector } from "../../test-utils";
import { clickNestedText } from "pentf/browser_utils";

export const description =
	"Show upgrade warning when Preact version is too old";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks-support", {
		preact: "10.3.4",
	});

	// State update
	await clickNestedText(devtools, "RefComponent");

	// Should print warning
	await waitForSelector(devtools, '[data-testid="no-hooks-support-warning"]');
}
