import { Page } from "puppeteer";
import { waitForSelector } from "../../../test-utils";

export async function getFlameNodes(page: Page) {
	const selector = '[data-type="flamegraph"] [data-id]';
	await waitForSelector(page, selector);
	return await page.$$eval(selector, els => {
		return els.map(el => {
			return {
				maximized: el.hasAttribute("data-maximized"),
				name: el.getAttribute("data-name") || "",
				visible: el.hasAttribute("data-visible"),
			};
		});
	});
}
