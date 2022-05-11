import { Page } from "puppeteer";

export async function getFlameNodes(page: Page) {
	return await page.$$eval('[data-type="flamegraph"] > *', els => {
		return els.map(el => {
			return {
				maximized: el.hasAttribute("data-maximized"),
				name: el.querySelector('[data-testid="node-name"]')!.textContent || "",
				visible: el.hasAttribute("data-visible"),
			};
		});
	});
}
