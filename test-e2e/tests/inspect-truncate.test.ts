import { newTestPage } from "../test-utils";
import { expect } from "chai";
import { closePage, clickText } from "pintf/browser_utils";

export const description = "Inspect should select node in elements panel";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "truncate");

	await clickText(devtools, "App", { elementXPath: "//*" });

	const row = '[data-testid="props-row"]';
	await devtools.waitForSelector(row);

	const texts = await devtools.$$eval(row, els => els.map(x => x.textContent));
	expect(texts).to.deep.equal([
		"blobBlob {}",
		'obj{type: "foo", props: null}',
		"obj2{foobarA: 1, foobarB: 1, foobarC: 1, foobarD: 1, foobarE: 1, foobarF: 1, foobarG: 1, foobarH: 1}",
		"arr[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]",
		"vnode<div />",
		"vnode2<Child />",
	]);

	await closePage(page);
}
