import { newPage } from "pentf/browser_utils";
import { wait } from "pentf/utils";
import fs from "fs";
import path from "path";
import { Request, Page } from "puppeteer";
import assert from "assert";

const readFile = (name: string) => {
	return fs.readFileSync(
		path.join(__dirname, ...name.split("/").filter(Boolean)),
		"utf-8",
	);
};

const TEST_URL = "http://localhost";

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

	const preactVersion = options.preact ? options.preact : "10.4.1";

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
				"preactCompat.js",
				`./vendor/preact/${preactVersion}/preactCompat.js`,
			) &&
			!mockResponse(
				req,
				"preactHooks.js",
				`./vendor/preact/${preactVersion}/preactHooks.js`,
			) &&
			!mockResponse(
				req,
				"preactDevtools.js",
				`./vendor/preact/${preactVersion}/preactDevtools.js`,
			) &&
			!mockResponse(req, "htm.js", "./vendor/htm.js") &&
			!mockResponse(req, "test-case.js", `./tests/fixtures/${name}.js`) &&
			!mockResponse(req, "iframe.html", "./iframe.html") &&
			!mockResponse(req, "iframe2.html", "./iframe2.html") &&
			!mockResponse(req, "iframe-content.js", "./tests/fixtures/counter.js") &&
			!mockResponse(
				req,
				"iframe-content2.js",
				"./tests/fixtures/context-displayName.js",
			) &&
			!mockResponse(req, TEST_URL, "./index.html")
		) {
			req.continue();
		}
	});

	await page.goto(TEST_URL);

	// Grab devtools that's inside the iframe
	const frames = await page.frames();
	const devtools = frames.find(f => f.url().includes("devtools.html"))!;
	(devtools as any).keyboard = page.keyboard;
	(devtools as any).mouse = Object.assign(
		Object.create(Object.getPrototypeOf(page.mouse)),
		page.mouse,
	);
	(devtools as any).mouse._client = (devtools as any)._client;

	return { page, devtools: (devtools as any) as Page };
}

export async function getAttribute(page: Page, selector: string, name: string) {
	await page.waitForSelector(selector, { timeout: 2000 });
	return page.$eval(
		selector,
		(el, propName) => {
			return propName in el ? (el as any)[propName] : el.getAttribute(propName);
		},
		name,
	);
}
export async function getAttribute$$(
	page: Page,
	selector: string,
	name: string,
) {
	await page.waitForSelector(selector, { timeout: 2000 });
	return page.$$eval(
		selector,
		(els, propName) => {
			return els.map(el => {
				return propName in el
					? (el as any)[propName]
					: el.getAttribute(propName);
			});
		},
		name,
	);
}

export async function getText(page: Page, selector: string) {
	return getAttribute(page, selector, "textContent");
}

export async function getText$$(page: Page, selector: string) {
	return getAttribute$$(page, selector, "textContent");
}

export async function hasSelector(page: Page, selector: string) {
	return page.evaluate(
		(s: string) => document.querySelector(s) !== null,
		selector,
	);
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
	await page.waitForSelector(selector, { timeout: 2000 });
	return page.click(selector);
}

export async function typeText(page: Page, selector: string, text: string) {
	const input = (await page.$(selector))!;
	if (!input) {
		throw new Error(`Could not find selector ${selector}`);
	}
	await input.click({ clickCount: 3 });
	if (text) {
		await page.type(selector, text);
	} else {
		await page.keyboard.press("Delete");
	}
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

export async function waitFor(
	fn: () => Promise<boolean> | boolean,
	{ timeout = 4000 }: { timeout?: number } = {},
) {
	const t = setTimeout(() => {
		throw new Error(`TimoutError: waiting for function exceeded ${timeout}ms`);
	}, timeout);

	await fn();
	clearTimeout(t);
}

export async function doesExist(page: Page, selector: string) {
	return await page.evaluate(
		(s: string) => document.querySelector(s) !== null,
		selector,
	);
}

export async function checkNotPresent(page: Page, selector: string) {
	const res = await page.evaluate(
		(s: string) => document.querySelector(s) === null,
		selector,
	);

	assert.equal(res, true, `Expected '${selector}' not to exist`);
}

export async function getCount(page: Page, selector: string) {
	return await (await page.$$(selector)).length;
}

// Preact Devtools specific functions
export async function clickTab(
	page: Page,
	tab: "ELEMENTS" | "PROFILER" | "SETTINGS",
) {
	await page.evaluate(name => {
		return document
			.querySelector(`[name="root-panel"][value="${name}"]`)!
			.closest("label")!
			.click();
	}, tab);
}

// This injects a box into the page that moves with the mouse;
// Useful for debugging
export async function installMouseHelper(page: Page) {
	await page.evaluate(() => {
		// Install mouse helper only for top-level frame.
		// if (window !== window.parent) return;
		const box = document.createElement("puppeteer-mouse-pointer");
		const styleElement = document.createElement("style");
		styleElement.innerHTML = `
        puppeteer-mouse-pointer {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: 10000;
          left: 0;
          width: 20px;
          height: 20px;
          background: red;
          border: 1px solid white;
          border-radius: 10px;
          margin: -10px 0 0 -10px;
          padding: 0;
          transition: background .2s, border-radius .2s, border-color .2s;
        }
        puppeteer-mouse-pointer.button-1 {
          transition: none;
          background: rgba(0,0,0,0.9);
        }
        puppeteer-mouse-pointer.button-2 {
          transition: none;
          border-color: rgba(0,0,255,0.9);
        }
        puppeteer-mouse-pointer.button-3 {
          transition: none;
          border-radius: 4px;
        }
        puppeteer-mouse-pointer.button-4 {
          transition: none;
          border-color: rgba(255,0,0,0.9);
        }
        puppeteer-mouse-pointer.button-5 {
          transition: none;
          border-color: rgba(0,255,0,0.9);
        }
      `;

		function updateButtons(event: any) {
			box.style.left = event.pageX + "px";
			box.style.top = event.pageY + "px";
			for (let i = 0; i < 5; i++)
				box.classList.toggle(
					"button-" + i,
					// @ts-ignore
					(event.buttons as any) & ((1 << i) as any),
				);
		}

		function handleEvent(event: MouseEvent) {
			updateButtons(event);
			box.classList.add("button-" + event.which);
		}
		document.head.appendChild(styleElement);
		document.body.appendChild(box);
		document.addEventListener("mousedown", handleEvent, true);
		document.addEventListener("click", handleEvent, true);
		document.addEventListener("mouseup", handleEvent, true);
	});
}

// TODO: Remove this once the next version of pentf is released
export async function clickNestedText(
	page: Page,
	textOrRegExp: string | RegExp,
	{
		timeout = 30000,
		checkEvery = 200,
		extraMessage = undefined,
		visible = true,
	} = {},
) {
	const serializedMatcher =
		typeof textOrRegExp !== "string"
			? { source: textOrRegExp.source, flags: textOrRegExp.flags }
			: textOrRegExp;

	let remainingTimeout = timeout;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const found = await page.evaluate(
			(matcher, visible) => {
				// eslint-disable-next-line no-undef
				let matchFunc: (text: string) => boolean;
				let matchFuncExact: null | ((text: string) => boolean) = null;

				if (typeof matcher == "string") {
					matchFunc = (text: string) => text.includes(matcher);
				} else {
					const regexExact = new RegExp(matcher.source, matcher.flags);
					matchFuncExact = (text: string) => {
						// Reset regex state in case global flag was used
						regexExact.lastIndex = 0;
						return regexExact.test(text);
					};

					// Remove leading ^ and ending $, otherwise the traversal
					// will fail at the first node.
					const source = matcher.source.replace(/^[^]/, "").replace(/[$]$/, "");
					const regex = new RegExp(source, matcher.flags);
					matchFunc = (text: string) => {
						// Reset regex state in case global flag was used
						regex.lastIndex = 0;
						return regex.test(text);
					};
				}

				const stack = [document.body];
				let item = null;
				let lastFound = null;
				while ((item = stack.pop())) {
					// eslint-disable-line no-cond-assign
					for (let i = 0; i < item.childNodes.length; i++) {
						const child = item.childNodes[i];

						// Skip text nodes as they are not clickable
						if (child.nodeType === Node.TEXT_NODE) {
							continue;
						}

						const text = child.textContent || "";
						if (child.childNodes.length > 0 && matchFunc(text)) {
							if (matchFuncExact === null || matchFuncExact(text)) {
								lastFound = child as any;
							}
							stack.push(child as any);
						}
					}
				}

				if (!lastFound) return false;

				if (visible && lastFound!.offsetParent === null) return null; // invisible)

				lastFound!.click();
				return true;
			},
			serializedMatcher,
			visible,
		);

		if (found) {
			return;
		}

		if (remainingTimeout <= 0) {
			const extraMessageRepr = extraMessage ? ` (${extraMessage})` : "";
			throw new Error(
				`Unable to find${
					visible ? " visible" : ""
				} text "${textOrRegExp}" after ${timeout}ms${extraMessageRepr}`,
			);
		}
		await wait(Math.min(remainingTimeout, checkEvery));
		remainingTimeout -= checkEvery;
	}
}
