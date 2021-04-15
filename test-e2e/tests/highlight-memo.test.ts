import { newTestPage, getSize } from "../test-utils";
import { expect } from "chai";
import { wait } from "pentf/utils";
import { waitForSelector } from "pentf/browser_utils";
import type { Page } from "puppeteer";

function getHighlightSize(page: Page): unknown {
	return getSize(page, "#preact-devtools-highlighter > div");
}

export const description = "Highlight Suspense nodes without crashing";
export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "memo3");

	throw "poop";
}
