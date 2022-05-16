import {
	newTestPage,
	waitFor,
	clickTab,
	clickRecordButton,
	waitForProfilerItem,
} from "../../test-utils";
import { clickSelector } from "pentf/browser_utils";

export const description =
	"Run update of a single node in the middle of the tree";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "update-single");

	await clickTab(devtools, "PROFILER");
	await clickRecordButton(devtools);

	await clickSelector(page, "button");

	await waitFor(async () => {
		return await page.$eval(
			'[data-testid="result"]',
			el => el.textContent === "1",
		);
	});

	await clickRecordButton(devtools);

	await waitForProfilerItem(devtools, "Counter");
}
