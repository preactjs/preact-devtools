import { expect, test } from "@playwright/test";
import { gotoTest } from "../pw-utils.ts";

test("Text Signal filter should filter Text Signal nodes", async ({ page }) => {
	test.skip(
		process.env.PREACT_VERSION !== "10",
		"Signals are not supported in v11 yet.",
	);
	const { devtools } = await gotoTest(page, "signals-text");

	await devtools
		.locator('[data-testid="elements-tree"] [data-name]')
		.first()
		.waitFor();

	let names = await devtools
		.locator('[data-testid="elements-tree"] [data-name]')
		.allTextContents();
	expect(names).toEqual(["App", "Counter"]);

	await devtools.click('[data-testid="filter-menu-button"]');
	await devtools.waitForSelector('[data-testid="filter-popup"]');
	await devtools.click(
		'[data-testid="filter-popup"] label:has-text("Text Signal nodes")',
	);
	await devtools.click('[data-testid="filter-update"]');

	await expect(
		devtools.locator('[data-testid="elements-tree"] [data-name]'),
	).toHaveCount(4);

	names = await devtools
		.locator('[data-testid="elements-tree"] [data-name]')
		.allTextContents();
	expect(names).toEqual(["App", "Counter", "__TextSignal", "__TextSignal"]);
});
