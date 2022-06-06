import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
	waitForSelector,
} from "../../../test-utils";
import { clickSelector, clickTestId } from "pentf/browser_utils";

export const description =
	"Selected node should be changed across commits if not present";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-2");

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await clickTestId(page, "counter-1");
	await clickTestId(page, "counter-2");
	await clickRecordButton(devtools);

	await click(devtools, '[name="flamegraph_mode"][value="RANKED"]');
	await clickSelector(devtools, '[data-name="Display"]');
	await clickTestId(devtools, "next-commit");

	await waitForSelector(
		devtools,
		'[data-type="ranked"] [data-selected="true"]',
	);
}
