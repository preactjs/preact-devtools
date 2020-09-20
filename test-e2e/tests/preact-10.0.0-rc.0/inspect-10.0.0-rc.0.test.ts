import { newTestPage, getSize } from "../../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";

export const description = "Test inspect highlighting in Preact 10.0.0-rc.0";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter-10.0.0-rc.0");

	const inspect = '[data-testid="inspect-btn"]';
	const highlight = '[data-testid="highlight"]';
	const target = '[data-testid="result"]';

	await devtools.click(inspect);

	await page.hover(target);
	await wait(500);
	const sizeTarget = await getSize(page, highlight);

	await page.hover("button");
	await wait(500);
	const sizeBtn = await getSize(page, highlight);

	expect(sizeTarget).not.to.deep.equal(sizeBtn);
}
