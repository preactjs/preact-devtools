import { newTestPage, click, waitFor } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";
import { clickSelector, waitForSelectorGone } from "pentf/browser_utils";

export const description = "Test hocs on update";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "forwardRef-update");

	await clickSelector(devtools, '[data-name="Foo"]');
	await waitForSelectorGone(
		devtools,
		'[data-name="Foo"] [data-testid="hoc-labels"]',
	);

	await click(page, "button");
	await waitFor(async () => {
		const res = await page.$eval('[data-testid="result"]', el => {
			return el.textContent;
		});

		expect(res).to.equal("Counter: 1");
		return true;
	});

	await wait(200);

	await clickSelector(devtools, '[data-name="Foo"]');
	await waitForSelectorGone(
		devtools,
		'[data-name="Foo"] [data-testid="hoc-labels"]',
	);
}
