import { expect, test } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Highlight iframe nodes", async ({ page }) => {
	const { devtools } = await gotoTest(page, "iframe");

	await page.waitForFunction(() => {
		const frames = Array.from(
			document.querySelectorAll<HTMLIFrameElement>("iframe:not(#devtools)"),
		);
		return (
			frames.length === 2 &&
			frames.every(
				frame => (frame.contentWindow as any)?.__PREACT_E2E_READY__ === true,
			)
		);
	});
	const fixtureFrames = page
		.frames()
		.filter(frame => /\/iframe2?\.html$/.test(frame.url()));
	await Promise.all(
		fixtureFrames.map(frame =>
			frame.waitForFunction(
				() => (window as any).__PREACT_E2E_READY__ === true,
			),
		),
	);

	// All six components should be mounted before we read the tree
	await expect(
		devtools.locator('[data-testid="elements-tree"] [data-name]'),
	).toHaveCount(6);

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
	const iframe2 = frames.find(frame => frame.url().endsWith("iframe2.html"));
	await iframe2!.waitForSelector(highlight);
});
