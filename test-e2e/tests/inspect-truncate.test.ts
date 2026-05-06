import { test, expect } from "@playwright/test";
import { gotoTest } from "../pw-utils";

test("Format inspected data", async ({ page }) => {
	const { devtools } = await gotoTest(page, "truncate");

	await devtools.locator('[data-name="App"]').click();

	await expect
		.poll(async () => {
			const texts = await devtools
				.locator('[data-testid="props-row"]')
				.allInnerTexts();
			return texts.map(x => x.replace(/\n/g, ""));
		})
		.toEqual([
			"arr[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]",
			"blobBlob {}",
			'obj{props: null, type: "foo"}',
			"obj2{foobarA: 1, foobarB: 1, foobarC: 1, foobarD: 1, foobarE: 1, foobarF: 1, foobarG: 1, foobarH: 1}",
			"vnode<div />",
			"vnode2<Child />",
		]);
});
