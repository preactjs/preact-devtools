import { chromium } from "playwright";

import path from "path";

async function main() {
	const extension = path.join(import.meta.dirname, "..", "dist", "chrome-debug");
	const browser = await chromium.launchPersistentContext("./profiles/chrome", {
		args: [
			`--disable-extensions-except=${extension}`,
			`--load-extension=${extension}`,
		],
		headless: false,
		devtools: true,
	});
	const page = await browser.newPage();
	await page.goto("https://preactjs.com");
}

main();
