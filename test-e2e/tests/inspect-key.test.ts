import { newTestPage, click } from "../test-utils";
import { expect } from "chai";
import {
	assertNotTestId,
	clickNestedText,
	getText,
	waitForTestId,
} from "pentf/browser_utils";
import { assertEventually } from "pentf/assert_utils";

export const description = "Show vnode key in the sidebar";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "keys");
	const origin = await page.evaluate(() => location.origin);
	await page.browserContext().overridePermissions(origin, ["clipboard-read"]);

	await clickNestedText(devtools, /ABC$/);
	await waitForTestId(devtools, "key-panel");

	const target = '[data-testid="vnode-key"]';
	expect(await getText(devtools, target)).to.equal("ABC");

	const copy = '[data-testid="key-panel"] button[title="Copy Key"]';
	await click(devtools, copy);

	const clipboard = await page.evaluate(() => navigator.clipboard.readText());
	expect(JSON.parse(clipboard)).to.equal("ABC");

	// Check that the keypanel is not present for keyless components
	await clickNestedText(devtools, "NoKey");
	await assertEventually(
		async () => {
			await assertNotTestId(devtools, "key-panel");
			return true;
		},
		{ timeout: 2000, crashOnError: false },
	);
}
