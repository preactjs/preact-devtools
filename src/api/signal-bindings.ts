import type { DevtoolsApiTarget, TreeOptions } from "./types";
import { byteLength, limit, readOwnData } from "./serialize";

/** Structural counterpart of the experimental signals in-page hook. */
export interface SignalDomBinding {
	readonly id: number;
	readonly signal: object;
	readonly effect: object;
	readonly target: Node;
	readonly kind: "text" | "property";
	readonly property?: string;
	readonly updates: number;
}
export interface SignalDomBindingSource {
	getSnapshot(maxBindings?: number): {
		bindings: SignalDomBinding[];
		truncated: boolean;
	};
	subscribe(callback: () => void): () => void;
}
export type SignalBindingNode =
	| {
			kind: "component";
			parent: null;
			rendererId: number;
			nodeId: number | null;
			name: string;
	  }
	| { kind: "signal"; parent: number | null; signalId: string; name: string }
	| {
			kind: "binding";
			parent: number;
			bindingId: number;
			effectId: string;
			bindingKind: "text" | "property";
			property?: string;
			updates: number;
	  };

/**
 * Experimental projection, NOT runtime VNodes or a replacement signal observer.
 * identify uses the signals debug identity function, for both signals and effects.
 * Never reads signal values or infers component ownership from DOM containment.
 */
export function unstable_createSignalBindingTree(
	target: DevtoolsApiTarget,
	source: SignalDomBindingSource,
	identify: (signalOrEffect: object) => string,
) {
	return {
		subscribe: (callback: () => void) => source.subscribe(callback),
		getTree(options: Pick<TreeOptions, "maxNodes" | "maxBytes"> = {}) {
			const maxNodes = limit(options.maxNodes, 1000, 10000, "maxNodes");
			const maxBytes = limit(options.maxBytes, 65536, 1048576, "maxBytes", 128);
			const snapshot = source.getSnapshot(maxNodes);
			const remaining = new Set(snapshot.bindings.map(b => b.target));
			const owners = new Map<
				Node,
				{
					rendererId: number;
					id: number | null;
					name: string;
					instance: object;
				}
			>();
			const result: { nodes: SignalBindingNode[]; truncated: boolean } = {
				nodes: [],
				truncated: snapshot.truncated,
			};
			let renderers = 0;
			for (const [rendererId, renderer] of target.renderers) {
				if (!remaining.size) break;
				if (++renderers > 128) {
					result.truncated = true;
					break;
				}
				const resolved = renderer.resolveDomComponents?.(remaining);
				if (!resolved) continue;
				result.truncated ||= resolved.truncated;
				for (const [dom, component] of resolved.matches) {
					owners.set(dom, { ...component, rendererId });
					remaining.delete(dom);
				}
			}
			const components = new Map<object, number>();
			const signals = new Map<number | null, Map<string, number>>();
			function identity(value: object) {
				const id = identify(value);
				if (typeof id !== "string" || id.length === 0 || id.length > 256)
					throw new RangeError(
						"Debug identity must be a string of 1–256 characters",
					);
				return id;
			}
			for (const binding of snapshot.bindings) {
				const owner = owners.get(binding.target);
				let parent: number | null = null;
				if (owner) {
					const index = components.get(owner.instance);
					if (index !== undefined) parent = index;
					else {
						if (result.nodes.length >= maxNodes) {
							result.truncated = true;
							break;
						}
						parent = result.nodes.length;
						components.set(owner.instance, parent);
						result.nodes.push({
							kind: "component",
							parent: null,
							rendererId: owner.rendererId,
							nodeId: owner.id,
							name: owner.name.slice(0, 256),
						});
					}
				}
				const signalId = identity(binding.signal);
				let group = signals.get(parent);
				if (!group) signals.set(parent, (group = new Map()));
				let signalParent = group.get(signalId);
				if (signalParent === undefined) {
					if (result.nodes.length >= maxNodes) {
						result.truncated = true;
						break;
					}
					signalParent = result.nodes.length;
					group.set(signalId, signalParent);
					const name = readOwnData(binding.signal, "name");
					result.nodes.push({
						kind: "signal",
						parent,
						signalId,
						name: typeof name === "string" ? name.slice(0, 256) : "Signal",
					});
				}
				if (result.nodes.length >= maxNodes) {
					result.truncated = true;
					break;
				}
				result.nodes.push({
					kind: "binding",
					parent: signalParent,
					bindingId: binding.id,
					effectId: identity(binding.effect),
					bindingKind: binding.kind,
					property: binding.property?.slice(0, 256),
					updates: binding.updates,
				});
			}
			if (byteLength(result) > maxBytes) {
				result.truncated = true;
				let low = 0,
					high = result.nodes.length;
				while (low < high) {
					const mid = Math.ceil((low + high) / 2);
					if (
						byteLength({ ...result, nodes: result.nodes.slice(0, mid) }) <=
						maxBytes
					)
						low = mid;
					else high = mid - 1;
				}
				result.nodes.length = low;
			}
			return result;
		},
	};
}
