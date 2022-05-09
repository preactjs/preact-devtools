import {
	newTestPage,
	installMouseHelper,
	waitForSelector,
} from "../test-utils";
import { expect } from "chai";
import { clickTestId, getText, waitForTestId } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Scroll a virtualized element into view #333";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "deep-tree-2");
	await installMouseHelper(devtools);

	const selector = '[data-name="App"]';
	await waitForSelector(devtools, selector);

	await clickTestId(devtools, "inspect-btn", {
		retryUntil: async () => {
			return (
				(await devtools.$(
					`[data-testid="inspect-btn"][data-active="true"]`,
				)) !== null
			);
		},
	});

	await page.evaluate(() => {
		const target = document.querySelector("#select-me") as HTMLHeadingElement;
		target.scrollIntoView();
	});

	await wait(1000);
	await page.hover("#select-me");

	await waitForTestId(page, "highlight");
	await wait(2000);
	await clickTestId(page, "select-me");
	await wait(1000);

	const text = await getText(devtools, '[data-selected="true"]');
	expect(text).to.equal("Foo");
}
