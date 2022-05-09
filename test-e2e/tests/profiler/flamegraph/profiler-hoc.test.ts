import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
	waitForSelector,
} from "../../../test-utils";

export const description = "Should work with filtered HOC roots";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "hoc-update");

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	await waitForSelector(
		devtools,
		'[data-type="flamegraph"] [data-name="Wrapped"]',
		{ timeout: 3000 },
	);
}
