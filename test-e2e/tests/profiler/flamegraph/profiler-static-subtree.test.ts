import { clickTestId } from "pentf/browser_utils";
import { expect } from "chai";
import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
	waitForSelector,
} from "../../../test-utils";
import { wait } from "pentf/utils";

export const description = "Should work with filtered HOC roots";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "static-subtree");

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await click(page, "button");
	await wait(50);
	await click(page, "button");
	await clickRecordButton(devtools);

	await waitForSelector(
		devtools,
		'[data-type="flamegraph"] [data-name="App"]',
		{ timeout: 3000 },
	);

	await clickTestId(devtools, "next-commit", {
		async retryUntil() {
			return await devtools.evaluate(() => {
				return (
					document.querySelector('[data-testid="commit-page-info"]')!
						.textContent === "2 / 2"
				);
			});
		},
	});

	await wait(300);

	const res = await devtools.evaluate(() => {
		const display = document.querySelector('[data-name="Display"]')!
			.clientWidth;
		const statics = Array.from(
			document.querySelectorAll('[data-name="Static"]')!,
		).map(el => el.clientWidth);

		return statics.every(w => w < display);
	});

	expect(res).to.equal(true, "Static nodes were bigger than Display");
}
