import {
	newTestPage,
	click,
	getText,
	clickNestedText,
	clickTab,
	clickRecordButton,
} from "../test-utils";
import { expect } from "chai";

export const description = "Sync selection from profiler";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "counter");

	await clickNestedText(devtools, "Counter");

	await clickTab(devtools, "PROFILER");

	await clickRecordButton(devtools);
	await click(page, "button");
	await clickRecordButton(devtools);

	await devtools.waitForSelector('[data-type="flamegraph"]');

	await clickNestedText(devtools, /^Displ/);

	await clickTab(devtools, "ELEMENTS");

	const text = await getText(devtools, "[data-selected]");
	expect(text).to.equal("Display");
}
