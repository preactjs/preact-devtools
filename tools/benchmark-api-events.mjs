/* eslint-disable no-console */
// Run with: node tools/benchmark-api-events.mjs
// Measures the event source, not total Preact render or browser/transport costs.
import { build } from "esbuild";
import { performance } from "node:perf_hooks";

const { outputFiles } = await build({
	entryPoints: [new URL("../src/api/events.ts", import.meta.url).pathname],
	bundle: true,
	write: false,
	platform: "node",
	format: "esm",
});
const { createEventSource } = await import(
	`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString("base64")}`
);
const batchSize = 128; // Below the queue capacity: no accidental overflow benchmark.
const batches = 2000;
const cases = [
	["no listeners", () => {}],
	["unrelated event", (s, cb) => s.onDevtoolsEvent("renderer-attached", cb)],
	[
		"other renderer",
		(s, cb) => s.onDevtoolsEvent("commit", cb, { rendererId: 2 }),
	],
	["one named", (s, cb) => s.onDevtoolsEvent("commit", cb)],
	["one wildcard", (s, cb) => s.onDevtoolsEvent("*", cb)],
	[
		"named + wildcard",
		(s, cb) => {
			s.onDevtoolsEvent("commit", cb);
			s.onDevtoolsEvent("*", cb);
		},
	],
	[
		"named + 1000 unrelated",
		(s, cb) => {
			s.onDevtoolsEvent("commit", cb);
			for (let i = 0; i < 1000; i++) s.onDevtoolsEvent("renderer-attached", cb);
		},
	],
];

console.log(
	`Node ${process.version}; ${batches * batchSize} emissions/run; median of 5 runs`,
);
console.log(
	"Includes microtask delivery and callbacks; excludes registration. Informational, not a CI threshold.",
);
for (const [name, setup] of cases) {
	const samples = [];
	let delivered = 0;
	for (let run = 0; run < 6; run++) {
		const source = createEventSource();
		delivered = 0;
		setup(source, () => delivered++);
		const start = performance.now();
		for (let batch = 0; batch < batches; batch++) {
			for (let i = 0; i < batchSize; i++)
				source.emitCommit(1, batch * batchSize + i);
			await Promise.resolve();
		}
		if (run > 0)
			samples.push(((performance.now() - start) * 1e6) / (batches * batchSize));
	}
	samples.sort((a, b) => a - b);
	console.log(
		`${name.padEnd(25)} ${samples[2].toFixed(1).padStart(8)} ns/emission; ${delivered} callbacks`,
	);
}
