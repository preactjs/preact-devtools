import { newTestPage, clickTab } from "../../test-utils";
import { assertNotSelector, waitForTestId } from "pentf/browser_utils";

export const description = "Display no stats initially";

export async function run(config: any) {
	const { devtools } = await newTestPage(config, "counter");

	await clickTab(devtools, "STATISTICS");
	await waitForTestId(devtools, "stats-info");

	await assertNotSelector(devtools, '[data-testid="vnode-stats"]');
}
