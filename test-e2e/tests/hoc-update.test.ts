import { newTestPage, waitForSelector } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";
import { clickSelector } from "pentf/browser_utils";

export const description = "Test hocs on update";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "static-subtree");

	await waitForSelector(
		devtools,
		'[data-name="Static"] [data-testid="hoc-labels"]',
	);

	await clickSelector(page, "button", {
		async retryUntil() {
			return await page.$eval('[data-testid="result"]', el => {
				return el.textContent === "Counter: 1";
			});
		},
	});

	await wait(100);

	const items = await devtools.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="hoc-labels"]')!,
		).map(x => x.textContent);
	});

	expect(items).to.deep.equal(["Memo", "Memo"]);
}
