import { performance } from "node:perf_hooks";
import { options } from "preact";
import { JSDOM } from "jsdom";
import { LynxTestingEnv } from "@lynx-js/testing-environment";

(globalThis as any).__DEBUG__ = false;

// Unlike the standard setup, the Lynx test run drives the adapter through the
// dual-threaded ReactLynx runtime emulated by `LynxTestingEnv`, which takes the
// host `window` directly (>=0.2, it no longer reads `global.jsdom`).
const jsdom = new JSDOM();
(globalThis as any).jsdom = jsdom;
const lynxTestingEnv = new LynxTestingEnv({
	window: jsdom.window as unknown as Window & typeof globalThis,
});
(globalThis as any).lynxTestingEnv = lynxTestingEnv;
lynxTestingEnv.mainThread.globalThis.getUniqueIdListBySnapshotId = () => {
	return [];
};
lynxTestingEnv.switchToBackgroundThread();

const { window } = jsdom;
(globalThis as any).window = window;
(globalThis as any).document = window.document;
(globalThis as any).performance = performance;
(options as any).document = window.document;

(globalThis as any).preactDevtoolsCtx = {
	...lynxTestingEnv.mainThread.globalThis,
	performance,
	Blob: window.Blob,
};
