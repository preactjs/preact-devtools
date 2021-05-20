import { newTestPage } from "../test-utils";
import { expect } from "chai";
import {
	clickNestedText,
	clickSelector,
	getText,
	typeSelector,
	waitForTestId,
} from "pentf/browser_utils";
import { waitForPass } from "pentf/assert_utils";

export const description = "Inspect Map and Set objects";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "inspect-map-set");

	await clickNestedText(devtools, /App$/);
	await waitForTestId(devtools, "Props");

	await waitForPass(async () => {
		const count = await devtools.$$eval(
			'[data-testid="props-row"]',
			els => els.length,
		);
		expect(count).to.equal(2);
	});

	await waitForPass(async () => {
		const values = await devtools.$$eval('[data-testid="prop-value"]', els =>
			Array.from(els).map(el => el.textContent),
		);
		expect(values).to.deep.equal([
			"Set(1) [{foo: 123}])",
			"Map(1) [[{foo: 123}, 123]])",
		]);
	});

	// Edit set
	await clickSelector(devtools, '[data-testid="prop-name"][data-type="set"]');
	await clickSelector(devtools, '[data-testid="props-row"][data-depth="2"]');
	await typeSelector(
		devtools,
		'[data-testid="props-row"][data-depth="3"] input',
		"12345",
	);
	await devtools.keyboard.press("Enter");
	await waitForPass(async () => {
		const text = await getText(page, "#json-set");
		expect(text).to.equal(JSON.stringify([{ foo: 12312345 }], null, 2));
	});

	// Close set
	await clickSelector(devtools, '[data-testid="prop-name"][data-type="set"]');

	// Edit map value
	await clickSelector(devtools, '[data-type="map"]');
	await clickSelector(devtools, '[data-testid="props-row"][data-depth="2"]');
	await typeSelector(
		devtools,
		'[data-testid="props-row"][data-depth="3"] input',
		"12345",
	);
	await devtools.keyboard.press("Enter");
	await waitForPass(async () => {
		const text = await getText(page, "#json-map");
		expect(text).to.equal(JSON.stringify([[{ foo: 123 }, 12312345]], null, 2));
	});

	// Edit map key
	await clickSelector(devtools, '[data-depth="3"] [data-testid="prop-name"]');
	await typeSelector(devtools, '[name="root.map.0.0.foo"]', "111");
	await devtools.keyboard.press("Enter");
	await waitForPass(async () => {
		const text = await getText(page, "#json-map");
		expect(text).to.equal(
			JSON.stringify([[{ foo: 123111 }, 12312345]], null, 2),
		);
	});
}
