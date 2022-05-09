import { waitForPass } from "pentf/assert_utils";
import { ignoreError } from "pentf/utils";
import { expect } from "chai";
import { strict as assert } from "assert";
import {
	getAttribute,
	newPage,
	resizePage,
	clickSelector,
} from "pentf/browser_utils";
import { Page } from "puppeteer";
import { getPreactVersions } from "./fixtures/utils";
import { wait } from "pentf/utils";

export interface TestOptions {
	preact?: string;
}

export async function waitForSelector(
	page: Page,
	selector: string,
	{ timeout = 5000, checkEvery = 200 } = {},
) {
	let remainingTimeout = timeout;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		let found = false;
		let errored = false;
		try {
			found = await page.evaluate(selector => {
				return !!document.querySelector(selector);
			}, selector);
		} catch (err) {
			errored = true;
			if (!ignoreError(err)) {
				throw err;
			}
		}

		if (!errored && found) {
			break;
		}

		if (remainingTimeout <= 0) {
			assert(found, `Element matching ${selector} is not found.`);
			break;
		}

		await wait(Math.min(checkEvery, remainingTimeout));
		remainingTimeout -= checkEvery;
	}
}

export async function newTestPage(
	config: any,
	name: string,
	options: TestOptions = {},
) {
	const page = await newPage(config);

	let preactVersion = options.preact;
	if (!preactVersion) {
		const versions = getPreactVersions();
		const envVersion = process.env.PREACT_VERSION;
		if (envVersion) {
			const parsed = versions.find(v => v.startsWith(envVersion));
			if (!parsed) {
				throw new Error(
					`Unknown preact version "${envVersion}" passed into PREACT_VERSION`,
				);
			}

			preactVersion = parsed;
		} else {
			preactVersion = versions[0];
		}
	}

	// Reset emulation
	await (page as any)._client.send("Emulation.clearDeviceMetricsOverride");

	await resizePage(config, page, {
		width: 1280,
		height: 768,
	});

	await page.goto(
		`http://localhost:8100/?fixtures=${name}&preact=${preactVersion}`,
	);

	// Grab devtools that's inside the iframe
	const frames = await page.frames();
	const devtools = frames.find(f => f.url().includes("devtools.html"))!;
	(devtools as any).keyboard = page.keyboard;
	(devtools as any).mouse = Object.assign(
		Object.create(Object.getPrototypeOf(page.mouse)),
		page.mouse,
	);

	return { page, devtools: (devtools as any) as Page };
}

export async function getAttribute$$(
	page: Page,
	selector: string,
	name: string,
) {
	await waitForSelector(page, selector);
	return page.$$eval(
		selector,
		(els: Element[], propName: any) => {
			return els.map(el => {
				return propName in el
					? (el as any)[propName]
					: el.getAttribute(propName);
			});
		},
		name,
	);
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
		(
			s: string,
			n: string,
			v: string | { source: string; flags: string; type: "regex" },
		) => {
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
	await waitForSelector(page, selector);
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

	await wait(500);
}

export async function getLog(page: Page) {
	return (await page.evaluate(() => (window as any).log)) as any[];
}

export async function getSize(page: Page, selector: string) {
	await waitForSelector(page, selector);
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

export async function getCount(page: Page, selector: string) {
	return await (await page.$$(selector)).length;
}

export type DevtoolsTab = "ELEMENTS" | "PROFILER" | "STATISTICS" | "SETTINGS";

// Preact Devtools specific functions
export async function clickTab(page: Page, tab: DevtoolsTab) {
	await page.evaluate(name => {
		return document
			.querySelector(`[name="root-panel"][value="${name}"]`)!
			.closest("label")!
			.click();
	}, tab);
}

export async function getActiveTab(page: Page): Promise<DevtoolsTab> {
	await waitForSelector(page, 'input[name="root-panel"]');
	return await page.evaluate(() => {
		const input = (Array.from(
			document.querySelectorAll('input[name="root-panel"]'),
		) as HTMLInputElement[]).find(el => el.checked);

		return (input ? input.value : "ELEMENTS") as DevtoolsTab;
	});
}

export async function clickRecordButton(page: Page) {
	const selector = '[data-testid="record-btn"]';
	await waitForSelector(page, selector);
	const start = /Start/.test(await getAttribute(page, selector, "title"));
	await clickSelector(page, selector);

	await waitForAttribute(
		page,
		selector,
		"title",
		start ? /Stop Recording/ : /Start Recording/,
	);
}

// TODO: This might clash with windowing
export async function getTreeViewItemNames(page: Page) {
	return await page.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map(el => el.getAttribute("data-name"));
	});
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

export async function getHooks(page: Page): Promise<Array<[string, string]>> {
	return await page.evaluate(() => {
		const rows = Array.from(
			document.querySelectorAll('[data-testid="props-row"]'),
		);

		return rows.map(item => {
			const name = item.querySelector('[data-testid="prop-name"]')!.textContent;
			let value = item.querySelector('[data-testid="prop-value"]')!.textContent;

			// Check if we're dealing with an input
			if (!value) {
				value =
					"" +
					(item.querySelector('[data-testid="prop-value"] input') as any).value;
			}

			return [name, value] as [string, string];
		}, []);
	});
}

export async function clickTreeItem(page: Page, name: string) {
	await clickSelector(
		page,
		`[data-testid="elements-tree"] [data-name="${name}"]`,
	);
}

export async function clickAndWaitForHooks(devtools: Page, component: string) {
	await waitForPass(async () => {
		await clickTreeItem(devtools, component);
		expect(await devtools.$('[data-testid="props-row"]')).not.to.equal(null);
	});
}

export async function moveMouseAbs(page: Page, x: number, y: number) {
	const { _x, _y } = page.mouse as any;
	await page.mouse.move(_x - x, _y - y);
}

export async function getProps(page: Page) {
	return await page.evaluate(() => {
		const names = Array.from(
			document.querySelectorAll(`[data-testid="prop-name"]`),
		).map(x => x.textContent || "");

		const values = Array.from(
			document.querySelectorAll(`[data-testid="prop-value"]`),
		).map(x => x.textContent || "");

		return names.reduce<Record<string, string>>((acc, name, i) => {
			acc[name] = values[i];
			return acc;
		}, {});
	});
}

export async function waitForProp(page: Page, name: string, value: string) {
	await waitForPass(async () => {
		const props = await getProps(page);
		expect(props[name]).to.equal(value);
	});
}
