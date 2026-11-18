# Headless DevTools API

`preact-devtools/api` provides a read-only API over an existing page hook. It does
not install a hook, mount the panel, change filters, start recording, or expose a
new global. The first version supports renderer discovery, tree snapshots and
bounded props/state/context inspection, and typed lifecycle/commit subscriptions.

```js
import { createDevtoolsApi } from "preact-devtools/api";

// The hook must already be installed, before the app connects to DevTools.
const api = createDevtoolsApi(window.__PREACT_DEVTOOLS__);

for (const renderer of api.getRenderers()) {
	if (!renderer.tree) continue;
	const tree = api.getTree(renderer.id, { maxNodes: 500, maxDepth: 10 });
	const node = tree.nodes.find(node => node.name === "Counter");
	if (renderer.inspect && node?.id != null) {
		console.log(
			api.inspect(renderer.id, node.id, {
				maxDepth: 3,
				maxEntries: 100,
				maxBytes: 16384,
			}),
		);
	}
}
```

The factory accepts a hook-like object with a `renderers` map; it does not depend
on a browser extension transport. A shell may expose the returned API on a global,
wrap it in messaging, or retain it privately. Only enable access in development or
through an explicit opt-in: inspected values may contain sensitive application data.

## Capabilities and identity

- `apiVersion` is `1`. `getRenderers()` reports each current renderer's numeric
  ID and `tree` / `inspect` / `commits` capabilities. It reflects later attachments/detachments.
- Older hooks/renderers may not support these capabilities. Unsupported operations,
  missing renderers and missing inspection targets return `null`. There is **no
  fallback** to legacy inspection, which can execute component code.
- Pass both the renderer ID and node ID to inspection. IDs are page-load-local,
  may become invalid after unmount/filter changes, and are not persistent selectors.
- This API does not attach to another frame automatically. Connect to that frame's
  hook separately, subject to normal browser access restrictions.

## Tree snapshots

`getTree(rendererId, options?)` returns `{ nodes, truncated, revision? }`. Current
renderers include a commit `revision` (initially zero), also present on commit
events. The snapshot reflects read time, not necessarily the commit whose
notification triggered the read. Refreshes/filter changes do not advance it. Nodes are a flat
preorder list containing `name`, `key`, `kind`, `id` and `parent`. `parent` is an
index in this particular snapshot, not a DevTools ID; root parents are `null`.
Kinds are `root`, `component`, `element` and `text`.

Snapshots walk the current VNodes without inspecting hooks, rendering components,
sending messages or changing filters. They include structural roots, DOM/text
nodes and other nodes hidden by the panel's filters. Nodes without an existing
DevTools ID have `id: null` and cannot be inspected by ID. Reading a snapshot never
assigns IDs to these nodes.

Defaults are 1000 nodes, depth 20 (root depth zero), and 65536 UTF-8 JSON bytes.
Names and keys are capped at 256 UTF-16 code units. Traversal also has a visit
budget to bound work through sparse child lists and stale root entries. A byte
limit can trim the preorder suffix; retained parent indices remain valid.

## Inspection snapshots

`inspect(rendererId, nodeId, options?)` returns `{ value, truncated }`.
`value` normally contains `props`, `state` and `context`. This is a detached JSON
snapshot, **not** the legacy panel inspection payload. Hooks, source locations,
signal identity/values and mutations are not part of this slice.

Inspection does not rerender components or evaluate accessor properties. It copies
plain objects and arrays through property descriptors. Accessors are represented
as `[Getter]`, functions as `[Function]`, undefined as `[Undefined]`, array holes
as `[Empty]`, and bigint/symbol values as strings. Non-plain instances (including
signals and DOM nodes) are opaque `[Instance]` values. `__source` and `__self`
properties are omitted. These marker strings are display representations, not a
lossless round-trip serialization format.

Defaults are depth 3, **100 entries total** across the response, string length
1000 and 65536 UTF-8 JSON bytes. Cycles, limits and opaque instances set
`truncated: true`. If the bounded result still exceeds the byte budget, its value
is replaced with `[MaxBytes]`. Check `truncated` before assuming completeness.

JavaScript proxies can execute traps during reflection; this API is not a sandbox
for hostile objects. It avoids invoking ordinary getters, `toJSON`, hook inspection
and application rendering, but cannot make arbitrary application objects inert.

## Event subscriptions

`api.supportsEvents` reports whether the hook supports subscriptions. Older hooks
can still provide snapshots; `on()` throws if event support is unavailable.
Each renderer's `commits` capability indicates whether its commits are observable.
No legacy transport messages or polling are used as fallbacks.

```ts
const offCommit = api.on(
	"commit",
	event => {
		// Inferred commit event: rendererId, revision, sequence, timestamp.
		const tree = api.getTree(event.rendererId);
	},
	{ rendererId: 1 },
);

const offAll = api.on("*", event => {
	// Discriminated union of public events.
	if (event.type === "commit") console.log(event.revision);
});

// Also observe overflow if you only subscribe to individual event types.
const offGaps = api.on("events-dropped", () => {
	// Re-read current renderers/snapshots.
});

offCommit();
offAll();
offGaps();
```

Events are:

- `renderer-attached` / `renderer-detached`: `rendererId`.
- `commit`: `rendererId` and monotonically increasing per-renderer `revision`.
  Includes updates/unmounts regardless of UI filters or emitted tree operations.
  Revisions count commit-hook invocations, not individual component renders.
- `events-dropped`: `rendererId: null`, `fromSequence`, `toSequence` (inclusive).
  This hook-wide gap bypasses renderer filters; the missing range can include
  events of other types/renderers.

Each event also contains a hook-local monotonic `sequence` and a
`performance.now()` `timestamp`. Gap sequences identify the last dropped event;
their timestamp is generated at delivery. Sequences are not persistent IDs or a
count of all app commits: unobserved event kinds need not consume a sequence.
Records are frozen, metadata-only, and contain no VNodes or application values.

Callbacks run in emission order in a queued microtask, never inline in the commit
hook. Events emitted by a callback are delivered in a later microtask. Listener
order across named/wildcard groups is unspecified. Synchronous callback exceptions
are logged and isolated; callback return values (including promises) are ignored.
Subscribe before taking an initial snapshot; notifications are **future-only**,
including when older events are awaiting delivery. Compare revisions to avoid
re-reading a snapshot already newer than a notification.

Delivery uses a hook-wide 256-event ring buffer. Overflow retains the latest
events and sends a gap to `events-dropped` and wildcard listeners before them.
This is a live invalidation stream, not lossless recording or a historical event
log. A detached renderer may no longer exist when an earlier event is delivered.
Renderer filtering happens before enqueue when no listener needs that renderer.

Each `on()` returns an idempotent unsubscribe function. Unsubscribing suppresses
pending callbacks too; remove every listener when its consumer is disposed.
Registration never replays existing renderers: call `getRenderers()` for discovery.
Wildcard subscriptions never enable profiling, render reasons, or value capture.
With no interested listeners, emission does not allocate an event, read a
timestamp, or schedule delivery. To benchmark the isolated event source, run
`node tools/benchmark-api-events.mjs` (Node timings, not browser render costs).

## Limits

Invalid limits throw `RangeError`; values must be finite integers in these ranges:

| Option                       | Range       |
| ---------------------------- | ----------- |
| Tree `maxNodes`              | 0–10000     |
| Tree `maxDepth`              | 0–100       |
| Inspection `maxDepth`        | 0–20        |
| Inspection `maxEntries`      | 0–10000     |
| Inspection `maxStringLength` | 1–10000     |
| `maxBytes`                   | 128–1048576 |
