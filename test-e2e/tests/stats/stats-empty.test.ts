import { newTestPage, clickTab, checkNotPresent } from "../../test-utils";
import { waitForTestId } from "pentf/browser_utils";

export const description = "Display no stats initially";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "counter", {
		preact: "next",
	});

	await clickTab(devtools, "STATISTICS");
	await waitForTestId(devtools, "stats-info");

	await checkNotPresent(devtools, '[data-testid="vnode-stats"]');
}
