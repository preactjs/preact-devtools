# Headless DevTools API

`preact-devtools/api` provides a read-only API over an existing page hook. It does
not install a hook, mount the panel, change filters, start recording, or expose a
new global. The first version supports renderer discovery, tree snapshots and
bounded props/state/context inspection.

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
  ID and `tree` / `inspect` capabilities. It reflects later attachments/detachments.
- Older hooks/renderers may not support these capabilities. Unsupported operations,
  missing renderers and missing inspection targets return `null`. There is **no
  fallback** to legacy inspection, which can execute component code.
- Pass both the renderer ID and node ID to inspection. IDs are page-load-local,
  may become invalid after unmount/filter changes, and are not persistent selectors.
- This API does not attach to another frame automatically. Connect to that frame's
  hook separately, subject to normal browser access restrictions.

## Tree snapshots

`getTree(rendererId, options?)` returns `{ nodes, truncated }`. Nodes are a flat
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
signal identity/values, mutations and event subscriptions are not part of this
first slice.

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
