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
			const parsed = versions.find(v => v.startsWith(envVersion));
			if (!parsed) {
				throw new Error(
					`Unknown preact version "${envVersion}" passed into PREACT_VERSION`,
				);
			}

			preactVersion = parsed;
		} else {
			preactVersion = versions.find(v => !v.includes("-"));
		}
	}

	await page.goto(
		`http://localhost:8100/?fixtures=${name}&preact=${preactVersion}`,
	);

	let fixtureError: Error | null = null;
	const captureFixtureError = (err: Error) => {
		fixtureError ??= err;
	};
	page.on("pageerror", captureFixtureError);
	try {
		const readyTimeout = 20_000;
		const deadline = Date.now() + readyTimeout;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			if (fixtureError) {
				throw new Error(`Fixture page error: ${(fixtureError as any).message}`);
			}
			let ready = false;
			try {
				ready = await page.evaluate(
					() => (window as any).__PREACT_E2E_READY__ === true,
				);
			} catch (err) {
				// The fixture page can briefly navigate while the query-string driven
				// fixture/preact selectors settle. Retry until the normal ready timeout.
				if (
					!String((err as Error).message).includes(
						"Execution context was destroyed",
					)
				) {
					throw err;
				}
			}
			if (ready) break;
			if (Date.now() > deadline) {
				throw new Error(
					`Timed out after ${readyTimeout}ms waiting for __PREACT_E2E_READY__ on ${name}`,
				);
			}
			await new Promise(r => setTimeout(r, 50));
		}
	} finally {
		page.off("pageerror", captureFixtureError);
	}

	const devtools = page
		.mainFrame()
		.childFrames()
		.find(frame => frame.url().endsWith("devtools.html"));

	assert(devtools);

	await devtools.waitForFunction(
		() => (window as any).__PREACT_DEVTOOLS_READY__ === true,
	);
	await devtools.waitForFunction(() => {
		return (
			document.querySelector('[data-testid="tree-item"]') !== null ||
			document.querySelector('[data-testid="msg-no-results"]') !== null ||
			document.querySelector('[data-testid="msg-only-connected"]') !== null
		);
	});

	return { devtools };
}

export const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

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

		return rows.map(item => {
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
		).map(x => x.textContent || "");

		const values = Array.from(
			document.querySelectorAll(
				`[data-testid="Props"] [data-testid="prop-value"]`,
			),
		).map(x => {
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
	await page.locator(selector + `[title="${state}"]`).waitFor();
}

export async function getTreeItems(page: Page | Frame) {
	return await page.evaluate(() => {
		return Array.from(
			document.querySelectorAll('[data-testid="tree-item"]'),
		).map(el => {
			return {
				name: el.getAttribute("data-name"),
				hocs: Array.from(el.querySelectorAll(".hoc-item")).map(
					h => h.textContent,
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
		).map(el => el.getAttribute("data-name"));
	});
}
