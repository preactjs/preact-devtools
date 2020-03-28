import { newPage } from "pintf/browser_utils";
import fs from "fs";
import path from "path";
import { Request, Page } from "puppeteer";

const readFile = (name: string) => {
	return fs.readFileSync(
		path.join(__dirname, ...name.split("/").filter(Boolean)),
		"utf-8",
	);
};

const TEST_URL = "http://test-preact-devtools.dev";

export function mockResponse(req: Request, test: string, file: string) {
	const mime = file.endsWith(".html")
		? "text/html"
		: file.endsWith(".js")
		? "text/javascript"
		: file.endsWith(".css")
		? "text/css"
		: "text/plain";

	if (req.url().includes(test)) {
		req.respond({
			headers: {
				"Content-Type": mime,
			},
			body: readFile(file),
		});
		return true;
	}

	return false;
}

export async function newTestPage(config: any, name: string) {
	const page = await newPage(config);

	// Reset emulation
	await (page as any)._client.send("Emulation.clearDeviceMetricsOverride");

	await page.setRequestInterception(true);
	page.on("request", req => {
		if (
			!mockResponse(req, "devtools.html", "./devtools.html") &&
			!mockResponse(req, "devtools.js", "../dist/inline/setup.js") &&
			!mockResponse(req, "devtools.css", "../dist/inline/setup.css") &&
			!mockResponse(req, "installHook.js", "../dist/inline/installHook.js") &&
			!mockResponse(req, "installHook.css", "../dist/inline/installHook.css") &&
			!mockResponse(req, "preact.js", "./vendor/preact.js") &&
			!mockResponse(req, "preactHooks.js", "./vendor/preactHooks.js") &&
			!mockResponse(req, "htm.js", "./vendor/htm.js") &&
			!mockResponse(req, "test-case.js", `./tests/fixtures/${name}.js`) &&
			!mockResponse(req, TEST_URL, "./index.html")
		) {
			req.continue();
		}
	});

	await page.goto(TEST_URL);

	// Grab devtools that's inside the iframe
	const frames = await page.frames();
	const devtools = frames.find(f => f.url().includes("devtools.html"))!;

	return { page, devtools: (devtools as any) as Page };
}

export async function getAttribute(page: Page, selector: string, name: string) {
	await page.waitForSelector(selector);
	return page.$eval(
		selector,
		(el, propName) => {
			return propName in el ? (el as any)[propName] : el.getAttribute(propName);
		},
		name,
	);
}

export async function getText(page: Page, selector: string) {
	return getAttribute(page, selector, "textContent");
}

export async function click(page: Page, selector: string) {
	await page.waitForSelector(selector);
	return page.$eval(selector, (el: any) => el.click());
}

export async function typeText(page: Page, selector: string, text: string) {
	const input = (await page.$(selector))!;
	await input.click({ clickCount: 3 });
	return page.type(selector, text);
}

export async function getLog(page: Page) {
	return (await page.evaluate(() => (window as any).log)) as any[];
}
