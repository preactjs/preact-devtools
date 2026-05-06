import { performance } from "node:perf_hooks";

(globalThis as any).performance = performance;
(globalThis as any).__DEBUG__ = false;
