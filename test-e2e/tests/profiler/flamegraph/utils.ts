import { Page } from "puppeteer";

export async function getFlameNodes(page: Page) {
	return await page.$$eval('[data-type="flamegraph"] > *', els => {
		return els.map(el => {
			const text = el.textContent!;
			return {
				maximized: el.hasAttribute("data-maximized"),
				name: text.slice(
					0,
					text.includes("(") ? text.lastIndexOf("(") - 1 : text.length,
				),
				visible: el.hasAttribute("data-visible"),
			};
		});
	});
}
