import { expect, test } from "@playwright/test";
import { gotoTest, wait } from "../pw-utils";

test("Highlight iframe nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "iframe");

	await devtools
		.locator("iframe")
		.evaluateAll(iframes =>
			(iframes as HTMLIFrameElement[]).every(
				x => x.contentDocument?.readyState == "complete",
			),
		);

	await devtools.locator('[data-testid="elements-tree"] [data-name]').waitFor();

	// TODO: Find a better solution
	await wait(1000);
	const elements = await devtools
		.locator('[data-testid="elements-tree"] [data-name]')
		.allTextContents();

	// Ordering is timing sensitive due to iframe loading. We just need
	// to check that both were loaded, so the order doesn't matter.
	expect(elements[0]).toEqual("View");

	if (elements[1] === "Counter") {
		expect(elements.slice(1, 3)).toEqual(["Counter", "Display"]);
		expect(elements.slice(3)).toEqual([
			"App",
			"Foobar.Provider",
			"Foobar.Consumer",
		]);
	} else {
		expect(elements.slice(1, 4)).toEqual([
			"App",
			"Foobar.Provider",
			"Foobar.Consumer",
		]);
		expect(elements.slice(4)).toEqual(["Counter", "Display"]);
	}

	const highlight = '[data-testid="highlight"]';

	// Display
	await devtools.hover('[data-name="Display"]');

	const frames = await page.frames();
	const iframe1 = frames.find(frame => frame.url().endsWith("iframe.html"));
	await iframe1!.waitForSelector(highlight);

	// Foobar.Consumer
	await devtools.hover('[data-name="Foobar.Consumer"]');
	const iframe2 = frames.find(frame => frame.url().endsWith("iframe.html"));
	await iframe2!.waitForSelector(highlight);
});
