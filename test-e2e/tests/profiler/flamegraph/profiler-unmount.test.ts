import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
	waitForSelector,
} from "../../../test-utils";
import { clickNestedText } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Should highlight flamegraph node if present in DOM";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-highlight");

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	await clickNestedText(page, "Toggle");

	await click(devtools, 'input[value="RANKED"]');
	await wait(1000);
	await click(devtools, 'input[value="FLAMEGRAPH"]');

	await waitForSelector(
		devtools,
		'[data-type="flamegraph"] [data-name="Counter"]',
		{ timeout: 3000 },
	);
}
