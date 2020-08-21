import { newTestPage } from "../../test-utils";
import { clickText } from "pentf/browser_utils";

export const description =
	"Show upgrade warning when Preact version is too old";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "hooks", {
		preact: "10.3.4",
	});

	// State update
	await clickText(devtools, "RefComponent", {
		elementXPath: "//*",
		timeout: 2000,
	});

	// Should print warning
	await devtools.waitForSelector('[data-testid="no-hooks-support-warning"]');
}
