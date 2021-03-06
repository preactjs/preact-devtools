import {
	newTestPage,
	click,
	clickTab,
	clickRecordButton,
} from "../../../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";

export const description = "Should highlight ranked node if present in DOM";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "profiler-highlight");

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	await click(devtools, 'input[value="RANKED"]');

	await devtools.hover('[data-type="ranked"] [data-name="Counter"]');

	// Wait for possible flickering to occur
	await wait(1000);

	const log = (await page.evaluate(() => (window as any).log)) as any[];
	expect(log.filter(x => x.type === "highlight").length).to.equal(1);
}
