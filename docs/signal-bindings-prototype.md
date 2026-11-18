# Experimental signal DOM-binding projection

This is a two-checkout prototype, not the final signals/DevTools integration contract.
It adds no panel or runtime VNodes and does not change the existing `getTree()` API.

## Run

With this DevTools branch and the signals `devtools-dom-bindings` branch:

```sh
node tools/prototype-signal-bindings.mjs /path/to/preact-signals
```

The harness bundles both source checkouts with one Preact/signals runtime, then
runs Chromium assertions without a UI or web server. It reuses signals-debug's
existing `getSignalId()` utility for canonical signal/effect identity; that utility
is currently an internal source import in the harness, not a new supported export.

## In-page contract

Enable `unstable_startDomBindingTracking()` from the experimental signals adapter
**before creating app VNodes**, then pass the returned source and the signals debug
identity resolver to `unstable_createSignalBindingTree(hook, source, identify)`.

The source records effect, original signal, DOM target, text/property kind, property
name and actual direct-write count. It has bounded `getSnapshot(maxBindings)`,
coalesced `subscribe(callback)`, and owner-controlled `dispose()`. A subscriber
can discover already registered bindings even if it subscribes after mounting.
This is not retroactive discovery of apps mounted before tracking was enabled.

The projection's `getTree({maxNodes, maxBytes})` returns a bounded flat tree:

```text
App (component)
  count (signal)
    value (property binding)
ReactiveTextNode (component)
  count (same canonical signal ID)
    text (text binding)
```

Parents are snapshot-local indices. Signal nodes can occur under multiple
components; binding IDs are scoped to the tracking session. No DOM nodes,
effects, signals or component-instance objects escape into the returned records.
Values are not read, and computeds are not evaluated for discovery.

## Lifecycle and limits

- Enablement has one owner and multiple independent subscribers. Dispose the
  owner after unmounting the app; unsubscribe each consumer separately.
- Only active bindings are retained, not historical events. Snapshot metadata
  fields are immutable; the raw runtime objects they reference remain live.
- Actual direct DOM writes increment binding counters, not component commit
  counters. Rebinding updates the source association; prop replacement/unmount
  removes records. Text/JSX transitions remove/recreate the text binding as needed.
- Source notifications are coalesced microtask invalidations, not a lossless
  attachment/write event log. Registration can observe an already pending invalidation.
- A runtime VNode walk resolves all requested DOM targets in one pass per
  renderer. It is capped at 10,000 visits and 128 renderers. No DOM-parent
  heuristics or component-name matching are used for attribution.
- The nearest runtime component may be an implementation wrapper, including
  `ReactiveTextNode` or a portal context bridge. Collapsing wrappers into the
  presentation tree is future work. Unresolved bindings remain at the root.
- Hidden components can still have null public node IDs. This prototype does
  not solve filter-independent component handles or alter the legacy ID mapper.
- The projection includes components with observed DOM bindings, not the whole
  component tree. It is not a complete signal inventory or dependency graph.
- Subscribe to component commits separately when component metadata matters;
  the projection subscription only reports binding registry changes.

Raw references stay in-page and are held only while bindings/tracking are active.
Do not transfer the source over a transport. Tracking is explicit and disabled by
default; existing generic signal/debug update hooks are not replaced or enabled.
