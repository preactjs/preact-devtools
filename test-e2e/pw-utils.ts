import { Frame, Page } from "@playwright/test";
import { getPreactVersions } from "./fixtures/utils";
import assert from "assert";

export interface TestOptions {
	preact?: string;
}

export async function gotoTest(
	page: Page,
	name: string,
	options: TestOptions = {},
) {
	let preactVersion = options.preact;
	if (!preactVersion) {
		const versions = getPreactVersions();
		const envVersion = process.env.PREACT_VERSION;
		if (envVersion) {
			const parsed = versions.find((v) => v.startsWith(envVersion));
			if (!parsed) {
				throw new Error(
					`Unknown preact version "${envVersion}" passed into PREACT_VERSION`,
				);
			}

			preactVersion = parsed;
		} else {
			preactVersion = versions.find((v) => !v.includes("-"));
		}
	}

	await page.goto(
		`http://localhost:8100/?fixtures=${name}&preact=${preactVersion}`,
	);

	const devtools = page
		.mainFrame()
		.childFrames()
		.find((frame) => frame.url().endsWith("devtools.html"));

	assert(devtools);

	// TODO: Find something better
	await wait(200);

	return { devtools };
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function waitForPass(
	fn,
	options: {
		timeout?: number;
		checkEvery?: number;
		crashOnError?: boolean;
	} = {},
) {
	const { timeout = 2000, checkEvery = 200, crashOnError = false } = options;

	let caughtError: Error | null = null;

	for (let remaining = timeout; remaining > 0; remaining -= checkEvery) {
		if (crashOnError) {
			const res = await fn();
			if (res) return res;
		} else {
			caughtError = null;
			let res;
			try {
				res = await fn();
			} catch (e) {
				caughtError = e;
			}
			if (caughtError === null) return res;
		}

		await wait(checkEvery);
	}

	if (caughtError !== null) {
		caughtError.message += ` (waited ${timeout})`;
		throw caughtError;
	}

	throw new Error(`waited ${timeout})`);
}

export async function waitFor(fn) {
	return waitForPass(fn, { crashOnError: true });
}

export async function getLog(page: Page) {
	return (await page.evaluate(() => (window as any).log)) as any[];
}

export async function getOwners(devtools: Frame | Page) {
	return devtools.locator('[data-testid="owners"] button').allInnerTexts();
}

export async function clickHookItem(devtools: Frame, name: string) {
	await devtools.click(
		`[data-testid="Hooks"] [data-testid="prop-name"]:has-text("${name}")`,
	);
}

export function locateTreeItem(name: string) {
	return `[data-testid="elements-tree"] [data-name="${name}"]`;
}

export function locateHook(name: string) {
	return `[data-testid="Hooks"] [data-testid="prop-name"]:has-text("${name}")`;
}

export function locateFlame(name: string) {
	return `[data-type="flamegraph"] [data-name="${name}"]`;
}

export async function clickTreeItem(devtools: Frame, name: string) {
	await devtools.click(`[data-testid="elements-tree"] [data-name="${name}"]`);
}

export async function getHooks(page: Frame): Promise<Array<[string, string]>> {
	return await page.evaluate(() => {
		const rows = Array.from(
			document.querySelectorAll(
				'[data-testid="Hooks"] [data-testid="props-row"]',
			),
		);

		return rows.map((item) => {
			const name = item.querySelector('[data-testid="prop-name"]')?.textContent;
			let value = item.querySelector('[data-testid="prop-value"]')?.textContent;

			// Check if we're dealing with an input
			if (!value) {
				const rawValue = (
					item.querySelector('[data-testid="prop-value"] input') as any
				)?.value;

				if (rawValue === undefined) {
					value = "";
				} else {
					value = String(rawValue);
				}
			}

			return [name, value] as [string, string];
		}, []);
	});
}

export async function getProps(page: Frame) {
	return await page.evaluate(() => {
		const names = Array.from(
			document.querySelectorAll(
				`[data-testid="Props"] [data-testid="prop-name"]`,
			),
		).map((x) => x.textContent || "");

		const values = Array.from(
			document.querySelectorAll(
				`[data-testid="Props"] [data-testid="prop-value"]`,
			),
		).map((x) => {
			const input = x.querySelector('input[type="text"]');
			if (input === null) return x.textContent || "";
			return (input as any).value;
		});

		return names.reduce<Record<string, string>>((acc, name, i) => {
			acc[name] = values[i];
			return acc;
		}, {});
	});
}

// Preact Devtools specific functions
export type DevtoolsTab = "ELEMENTS" | "PROFILER" | "STATISTICS" | "SETTINGS";
export function locateTab(tab: DevtoolsTab) {
	return `label.tab:has([name="root-panel"][value="${tab}"])`;
}

export function locateProfilerTab(tab: "RANKED" | "FLAMEGRAPH") {
	return `label:has(input[type="radio"][value="${tab}"])`;
}

export async function clickRecordButton(page: Frame) {
	const selector = '[data-testid="actions"] [data-testid="record-btn"]';
	const title = (await page.locator(selector).getAttribute("title")) || "";
	const start = /Start/.test(title);
	await page.locator(selector).click();

	const state = start ? "Stop Recording" : "Start Recording";
	await page.locator(selector + `[title="${state}"]`);
}

export async function getTreeItems(page: Page | Frame) {
	return await page.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map((el) => {
			return {
				name: el.getAttribute("data-name"),
				hocs: Array.from(el.querySelectorAll(".hoc-item")).map(
					(h) => h.textContent,
				),
			};
		});
	});
}

// TODO: This might clash with windowing
export async function getTreeViewItemNames(page: Frame | Page) {
	return await page.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map((el) => el.getAttribute("data-name"));
	});
}
