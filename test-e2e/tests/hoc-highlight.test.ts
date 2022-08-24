import { test, Frame, Page } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("HOC-Component original name should show in highlight", async ({
	page,
}) => {
	const { devtools } = await gotoTest(page, "hoc");

	await assertHighlightName(page, devtools, "Bar");
	await assertHighlightName(page, devtools, "Anonymous");
	await assertHighlightName(page, devtools, "Last");
});

async function assertHighlightName(page: Page, devtools: Frame, name: string) {
	const selector = `[data-testid="tree-item"][data-name="${name}"]`;
	await devtools.waitForSelector(selector);

	await devtools.hover(selector);

	await page
		.locator(`[data-testid=highlighter-label]:has-text("${name}")`)
		.waitFor();
}
