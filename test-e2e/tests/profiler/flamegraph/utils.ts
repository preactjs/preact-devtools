import { Frame } from "@playwright/test";

export async function getFlameNodes(page: Frame) {
	const selector = '[data-type="flamegraph"] [data-id]';
	await page.waitForSelector(selector);
	return await page.$$eval(selector, els => {
		return els.map(el => {
			return {
				maximized: el.getAttribute("data-maximized") === "true",
				name: el.getAttribute("data-name") || "",
				hocs: Array.from(el.querySelectorAll(".hoc-item")).map(
					el => el.textContent,
				),
				visible: el.getAttribute("data-visible") === "true",
			};
		});
	});
}
