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

export interface TestOptions {
	preact?: string;
}

export async function newTestPage(
	config: any,
	name: string,
	options: TestOptions = {},
) {
	const page = await newPage(config);

	const preactVersion = options.preact ? options.preact : "10.3.4";

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
			!mockResponse(
				req,
				"preact.js",
				`./vendor/preact/${preactVersion}/preact.js`,
			) &&
			!mockResponse(
				req,
				"preactHooks.js",
				`./vendor/preact/${preactVersion}/preactHooks.js`,
			) &&
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

export async function waitForAttribute(
	page: Page,
	selector: string,
	name: string,
	value: string | number | null | undefined | RegExp,
	options: any = {},
) {
	await page.waitForFunction(
		(s, n, v) => {
			const el = document.querySelector(s);
			if (el === null) return false;
			const attr = n in el ? (el as any)[n] : el.getAttribute(n);
			if (typeof v === "object" && v !== null && v.type === "regex") {
				return new RegExp(v.source, v.flags).test(attr);
			}

			return attr === v;
		},
		{ timeout: 3000, ...options },
		selector,
		name,
		value instanceof RegExp
			? { type: "regex", source: value.source, flags: value.flags }
			: value === undefined
			? null
			: value,
	);
}

export async function click(page: Page, selector: string) {
	await page.waitForSelector(selector);
	return page.click(selector);
}

export async function typeText(page: Page, selector: string, text: string) {
	const input = (await page.$(selector))!;
	await input.click({ clickCount: 3 });
	return page.type(selector, text);
}

export async function getLog(page: Page) {
	return (await page.evaluate(() => (window as any).log)) as any[];
}

export async function getSize(page: Page, selector: string) {
	return page.$eval(selector, el => {
		const rect = el.getBoundingClientRect();
		return {
			x: rect.x,
			y: rect.y,
			top: rect.top,
			bottom: rect.bottom,
			left: rect.left,
			right: rect.right,
			width: rect.width,
			height: rect.height,
		};
	});
}
