import { ID } from "../../view/store/types";
import { MsgTypes } from "../events/events";
import { VNode } from "preact";
import { RendererConfig10 } from "./renderer";

export enum DiffType {
	UNKNOWN = 0,
	KEYED = 1,
	UNKEYED = 2,
	MIXED = 3,
}

export function getDiffType(child: VNode, prev: DiffType) {
	if (prev !== DiffType.MIXED) {
		if (child.key != null) {
			return prev === DiffType.UNKNOWN || prev === DiffType.KEYED
				? DiffType.KEYED
				: DiffType.MIXED;
		} else {
			return prev === DiffType.UNKNOWN || prev === DiffType.UNKEYED
				? DiffType.UNKEYED
				: DiffType.MIXED;
		}
	}
	return prev;
}

export interface ComponentStats {
	total: number;
	children: number[];
}

export interface Stats {
	classComponents: ComponentStats;
	functionComponents: ComponentStats;
	fragments: ComponentStats;
	elements: ComponentStats;
	roots: number;
	text: number;
	keyed: ComponentStats;
	unkeyed: ComponentStats;
	mixed: ComponentStats;
	mounts: number;
	updates: number;
	unmounts: number;
}

export function updateDiffStats(
	stats: Stats,
	diff: DiffType,
	childCount: number,
) {
	if (diff === DiffType.KEYED) {
		stats.keyed.total++;
		stats.keyed.children.push(childCount);
	} else if (diff === DiffType.UNKEYED) {
		stats.unkeyed.total++;
		stats.unkeyed.children.push(childCount);
	} else if (diff === DiffType.MIXED) {
		stats.mixed.total++;
		stats.mixed.children.push(childCount);
	}
}

// TODO: store children count
// TODO: store update depth
export function createStats(): Stats {
	return {
		classComponents: {
			total: 0,
			children: [],
		},
		functionComponents: {
			total: 0,
			children: [],
		},
		fragments: {
			total: 0,
			children: [],
		},
		elements: {
			total: 0,
			children: [],
		},
		text: 0,
		roots: 0,
		keyed: {
			total: 0,
			children: [],
		},
		unkeyed: {
			total: 0,
			children: [],
		},
		mixed: {
			total: 0,
			children: [],
		},
		mounts: 0,
		unmounts: 0,
		updates: 0,
	};
}

export function recordComponentStats(
	config: RendererConfig10,
	stats: Stats,
	vnode: VNode,
	childrenLen: number,
) {
	const type = vnode.type;
	if (typeof type === "function") {
		if (type.prototype && type.prototype.render) {
			stats.classComponents.total++;
			stats.classComponents.children.push(childrenLen);
		} else {
			stats.functionComponents.total++;
			stats.functionComponents.children.push(childrenLen);

			if (type === config.Fragment) {
				stats.fragments.total++;
				stats.fragments.children.push(childrenLen);
			}
		}
	} else if (type !== null) {
		stats.elements.total++;
		stats.elements.children.push(childrenLen);
	} else {
		stats.text++;
	}
}

export function stats2ops(rootId: ID, stats: Stats): number[] {
	console.log(stats);
	return [
		MsgTypes.COMMIT_STATS,
		rootId,
		stats.roots,

		stats.classComponents.total,
		stats.classComponents.children.length,
		...stats.classComponents.children,

		stats.functionComponents.total,
		stats.functionComponents.children.length,
		...stats.functionComponents.children,

		stats.fragments.total,
		stats.fragments.children.length,
		...stats.fragments.children,

		stats.elements.total,
		stats.elements.children.length,
		...stats.elements.children,

		stats.text,

		stats.keyed.total,
		stats.keyed.children.length,
		...stats.keyed.children,
		stats.unkeyed.total,
		stats.unkeyed.children.length,
		...stats.unkeyed.children,
		stats.mixed.total,
		stats.mixed.children.length,
		...stats.mixed.children,

		stats.mounts,
		stats.updates,
		stats.unmounts,
	];
}

export interface ParsedComponentStats {
	total: number;
	children: Map<number, number>;
}

export interface ParsedStats {
	classComponents: ParsedComponentStats;
	functionComponents: ParsedComponentStats;
	fragments: ParsedComponentStats;
	elements: ParsedComponentStats;
	roots: number;
	text: number;
	keyedTotal: number;
	keyed: Map<number, number>;
	unkeyedTotal: number;
	unkeyed: Map<number, number>;
	mixedTotal: number;
	mixed: Map<number, number>;
	mounts: number;
	updates: number;
	unmounts: number;
}

export function parseComponentStats(i: number, ops: number[]) {
	const total = ops[i++];
	const len = ops[i++];
	const children = new Map();

	let j = len;
	while (j--) {
		const value = children.get(ops[i + j]) || 0;
		children.set(ops[i + j], value + 1);
	}

	i += len;

	return {
		i,
		total,
		children,
	};
}

export function parseStats(ops: number[]): ParsedStats {
	let i = 1;
	// const rootId = ops[i++];
	const roots = ops[i++];

	const klass = parseComponentStats(i, ops);
	i = klass.i;

	const fnComps = parseComponentStats(i, ops);
	i = fnComps.i;

	const fragments = parseComponentStats(i, ops);
	i = fragments.i;

	const elements = parseComponentStats(i, ops);
	i = elements.i;

	const text = ops[i++];

	const keyedTotal = ops[i++];
	const keyLen = ops[i++];
	const keyed = new Map();
	let j = keyLen;
	while (j--) {
		const value = keyed.get(ops[i + j]) || 0;
		keyed.set(ops[i + j], value + 1);
	}
	i = i + keyLen;

	const unkeyedTotal = ops[i++];
	const unkeyLen = ops[i++];
	const unkeyed = new Map();
	j = unkeyLen;
	while (j--) {
		const value = unkeyed.get(ops[i + j]) || 0;
		unkeyed.set(ops[i + j], value + 1);
	}
	i = i + unkeyLen;

	const mixedTotal = ops[i++];
	const mixedLen = ops[i++];
	const mixed = new Map();
	j = mixedLen;
	while (j--) {
		const value = mixed.get(ops[i + j]) || 0;
		mixed.set(ops[i + j], value + 1);
	}
	i = i + mixedLen;

	const mounts = ops[i++];
	const updates = ops[i++];
	const unmounts = ops[i++];

	return {
		roots,
		classComponents: klass,
		functionComponents: fnComps,
		fragments,
		elements,
		text,

		keyedTotal,
		keyed,
		unkeyedTotal,
		unkeyed,
		mixedTotal,
		mixed,

		mounts,
		updates,
		unmounts,
	};
}
