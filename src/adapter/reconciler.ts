import { VNode } from "preact";
import { NodeType } from "../constants";
import { DevNodeType, ID } from "../view/store/types";
import { updateVNodeId } from "./10/IdMapper";
import { ProfilerState } from "./10/renderer";
import { RenderReason, getRenderReason } from "./10/renderer/renderReasons";
import { DiffType, updateDiffStats, createStats, Stats } from "./stats";
import { getDom } from "./10/vnode";
import { InspectData } from "./adapter/adapter";
import { FilterState } from "./adapter/filter";
import { measureUpdate, startDrawing } from "./adapter/highlightUpdates";
import { BaseEvent } from "./adapter/port";
import { Commit, flush, MsgTypes } from "./events/events";
import { ProfilerOptions } from "./hook";
import { getStringId } from "./string-table";

function isTextNode(dom: HTMLElement | Text | null): dom is Text {
	return dom != null && dom.nodeType === NodeType.Text;
}

function updateHighlight(profiler: ProfilerState, vnode: VNode) {
	if (profiler.highlightUpdates && typeof vnode.type === "function") {
		let dom = getDom(vnode);
		if (isTextNode(dom)) {
			dom = dom.parentNode as HTMLElement;
		}
		if (dom && !profiler.pendingHighlightUpdates.has(dom)) {
			profiler.pendingHighlightUpdates.add(dom);
			measureUpdate(profiler.updateRects, dom);
		}
	}
}

function getHocName(name: string) {
	const idx = name.indexOf("(");
	if (idx === -1) return null;

	const wrapper = name.slice(0, idx);
	return wrapper ? wrapper : null;
}

function addHocs(commit: Commit, id: ID, hocs: string[]) {
	if (hocs.length > 0) {
		commit.operations.push(MsgTypes.HOC_NODES, id, hocs.length);
		for (let i = 0; i < hocs.length; i++) {
			const stringId = getStringId(commit.strings, hocs[i]);
			commit.operations.push(stringId);
		}
	}
}

function getDiffType<T>(host: ReconcilerHost<T>, child: T, prev: DiffType) {
	if (prev !== DiffType.MIXED) {
		if (host.getKey(child) != null) {
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

export function mount<T>(
	host: ReconcilerHost<T>,
	commit: Commit,
	vnode: T,
	ancestorId: ID,
	filters: FilterState,
	profiler: ProfilerState,
	hocs: string[],
) {
	if (commit.stats !== null) {
		commit.stats.mounts++;
	}

	const root = host.isRoot(vnode);
	const skip = host.shouldFilter(vnode, filters);
	if (root || !skip) {
		record: {
			const id = host.hasId(vnode) ? host.getId(vnode) : host.createId(vnode);
			let name = host.getDisplayName(vnode);

			if (filters.type.has("hoc")) {
				const hocName = getHocName(name);

				// Filter out HOC-Components
				if (hocName) {
					if (name.startsWith("ForwardRef")) {
						hocs = [...hocs, hocName];
						const idx = name.indexOf("(");
						name = name.slice(idx + 1, -1) || "Anonymous";
					} else {
						hocs = [...hocs, hocName];
						break record;
					}
				}
			}

			if (root) {
				commit.operations.push(MsgTypes.ADD_ROOT, id);
			}

			const key = host.getKey(vnode);
			commit.operations.push(
				MsgTypes.ADD_VNODE,
				id,
				host.getType(vnode),
				ancestorId,
				9999, // owner
				getStringId(commit.strings, name),
				key ? getStringId(commit.strings, key) : 0,
				// Multiply, because operations array only supports integers
				// and would otherwise cut off floats
				host.getStartTime(vnode) * 1000,
				host.getEndTime(vnode) * 1000,
			);

			if (hocs.length > 0) {
				addHocs(commit, id, hocs);
				hocs = [];
			}

			// Capture render reason (mount here)
			if (profiler.isProfiling && profiler.captureRenderReasons) {
				commit.operations.push(
					MsgTypes.RENDER_REASON,
					id,
					RenderReason.MOUNT,
					0,
				);
			}

			if (profiler.highlightUpdates) {
				updateHighlight(profiler, vnode);
			}

			ancestorId = id;
		}
	}

	host.updateElementCache(vnode);

	let diff = DiffType.UNKNOWN;
	let childCount = 0;

	const children = host.getChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child != null) {
			if (commit.stats !== null) {
				diff = getDiffType(host, child, diff);
				childCount++;
			}

			mount(host, commit, child, ancestorId, filters, profiler, hocs);
		}
	}

	if (commit.stats !== null) {
		updateDiffStats(commit.stats, diff, childCount);
		host.recordStats(commit.stats, vnode, children);
	}
}

export function resetChildren<T>(
	host: ReconcilerHost<T>,
	commit: Commit,
	vnode: T,
	filters: FilterState,
) {
	const children = host.getChildren(vnode);
	if (!children.length) return;

	const next = getFilteredChildren(host, vnode, filters);
	if (!host.shouldForceReorder(vnode) && next.length < 2) return;

	const id = host.getId(vnode);
	commit.operations.push(MsgTypes.REORDER_CHILDREN, id, next.length);
	next.forEach(child => {
		commit.operations.push(host.getId(child));
	});
}

export function getFilteredChildren<T>(
	host: ReconcilerHost<T>,
	vnode: T,
	filters: FilterState,
): T[] {
	const children = host.getChildren(vnode);
	const stack = children.slice();

	const out: T[] = [];

	let child;
	while (stack.length) {
		child = stack.pop();
		if (child != null) {
			if (!host.shouldFilter(child, filters)) {
				out.push(child);
			} else {
				const nextChildren = host.getChildren(child);
				if (nextChildren.length > 0) {
					stack.push(...nextChildren.slice());
				}
			}
		}
	}

	return out.reverse();
}

export function update<T>(
	host: ReconcilerHost<T>,
	commit: Commit,
	vnode: T,
	ancestorId: number,
	filters: FilterState,
	profiler: ProfilerState,
	hocs: string[],
) {
	if (commit.stats !== null) {
		commit.stats.updates++;
	}

	let diff = DiffType.UNKNOWN;

	const skip = host.shouldFilter(vnode, filters);
	if (skip) {
		let childCount = 0;
		const children = host.getChildren(vnode);
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child != null) {
				if (commit.stats !== null) {
					diff = getDiffType(host, child, diff);
					childCount++;
				}

				update(host, commit, child, ancestorId, filters, profiler, hocs);
			}
		}

		if (commit.stats !== null) {
			updateDiffStats(commit.stats, diff, childCount);
			host.recordStats(commit.stats, vnode, children);
		}
		return;
	}

	if (!host.hasId(vnode)) {
		mount(host, commit, vnode, ancestorId, filters, profiler, hocs);
		return true;
	}

	const id = host.getId(vnode);
	commit.operations.push(
		MsgTypes.UPDATE_VNODE_TIMINGS,
		id,
		host.getStartTime(vnode) * 1000,
		host.getEndTime(vnode) * 1000,
	);

	const name = host.getDisplayName(vnode);
	const hoc = getHocName(name);
	if (hoc) {
		hocs = [...hocs, hoc];
	} else {
		addHocs(commit, id, hocs);
		hocs = [];
	}

	const oldVNode = host.getVNode(id);
	updateVNodeId(ids, id, vnode);

	if (profiler.isProfiling && profiler.captureRenderReasons) {
		const reason = getRenderReason(oldVNode, vnode);
		if (reason !== null) {
			const count = reason.items ? reason.items.length : 0;
			commit.operations.push(MsgTypes.RENDER_REASON, id, reason.type, count);
			if (reason.items && count > 0) {
				commit.operations.push(
					...reason.items.map(str => getStringId(commit.strings, str)),
				);
			}
		}
	}

	updateHighlight(profiler, vnode);

	const oldChildren = oldVNode
		? host.getChildren(oldVNode).map((v: any) => v && host.getId(v))
		: [];

	let shouldReorder = false;
	let childCount = 0;

	const children = host.getChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child == null) {
			if (oldChildren[i] != null) {
				commit.unmountIds.push(oldChildren[i]);
			}
		} else if (host.hasId(child) || host.shouldFilter(child, filters)) {
			if (commit.stats !== null) {
				diff = getDiffType(host, child, diff);
				childCount++;
			}
			update(host, commit, child, id, filters, profiler, hocs);
			// TODO: This is only sometimes necessary
			shouldReorder = true;
		} else {
			if (commit.stats !== null) {
				diff = getDiffType(host, child, diff);
				childCount++;
			}
			mount(host, commit, child, id, filters, profiler, hocs);
			shouldReorder = true;
		}
	}

	if (commit.stats !== null) {
		updateDiffStats(commit.stats, diff, childCount);
		host.recordStats(commit.stats, vnode, children);
	}

	if (shouldReorder) {
		resetChildren(host, commit, vnode, filters);
	}
}

export function createCommit<T>(
	host: ReconcilerHost<T>,
	roots: Set<T>,
	vnode: T,
	filters: FilterState,
	profiler: ProfilerState,
	statState: StatState,
): Commit {
	const commit = {
		operations: [],
		rootId: -1,
		strings: new Map(),
		unmountIds: [],
		renderReasons: new Map(),
		stats: statState.isRecording ? createStats() : null,
	};

	let parentId = -1;

	const isNew = !host.hasId(vnode);

	if (host.isRoot(vnode)) {
		if (commit.stats !== null) {
			commit.stats.roots.total++;
			const children = host.getChildren(vnode);
			commit.stats.roots.children.push(children.length);
		}

		parentId = -1;
		roots.add(vnode);
	} else {
		const ancestor = host.getAncestor(vnode);
		if (ancestor) {
			parentId = host.getId(ancestor);
		}
	}

	if (isNew) {
		mount(host, commit, vnode, parentId, filters, profiler, []);
	} else {
		update(host, commit, vnode, parentId, filters, profiler, []);
	}

	commit.rootId = host.getId(vnode);

	return commit;
}

export interface ReconcilerHost<T> {
	/** @deprecated */
	flushInitial?(): void;

	// Traversal
	shouldFilter(vnode: T, filters: FilterState): boolean;
	shouldForceReorder(vnode: T): boolean;
	isRoot(vnode: T): boolean;
	getAncestor(vnode: T): T | null;
	getChildren(vnode: T): Array<T | undefined | null>;
	updateElementCache(vnode: T): void;

	// ID mapping
	hasId(vnode: T): boolean;
	getId(vnode: T): ID;
	createId(vnode: T): ID;
	removeId(vnode: T): void;
	updateId(vnode: T): void;

	// Data
	getKey(vnode: T): string | null;
	getStartTime(vnode: T): number;
	getEndTime(vnode: T): number;
	getDisplayName(vnode: T): string;
	getType(vnode: T): DevNodeType;

	// Statistics
	recordStats(
		stats: Stats,
		vnode: T,
		children: Array<T | null | undefined>,
	): void;

	// Other
	inspect(id: ID): InspectData | null;
	onViewSource(id: ID): void;
	log(id: ID, devtoolsChildren: ID[]): void;
	highlightUpdate(vnode: T): void;
}

export interface StatState {
	isRecording: boolean;
}

export function createReconciler<T>(host: ReconcilerHost<T>) {
	const profiler: ProfilerState = {
		isProfiling: false,
		highlightUpdates: false,
		updateRects: new Map(),
		pendingHighlightUpdates: new Set(),
		captureRenderReasons: false,
	};

	const filters: FilterState = {
		regex: [],
		// TODO: Add default hoc-filter
		type: new Set(["dom", "fragment"]),
	};
	const roots = new Set<T>();
	const statState: StatState = {
		isRecording: false,
	};

	let currentUnmounts: ID[] = [];

	function onUnmount(vnode: T) {
		if (!host.shouldFilter(vnode, filters)) {
			if (host.hasId(vnode)) {
				currentUnmounts.push(host.getId(vnode));
			}
		}

		host.removeId(vnode);
	}

	function applyFilters(nextFilters: FilterState) {
		/** Queue events and flush in one go */
		const queue: BaseEvent<any, any>[] = [];

		roots.forEach(root => {
			const rootId = host.getId(root);
			traverse(root, vnode => onUnmount(vnode));

			const commit: Commit = {
				operations: [],
				rootId,
				strings: new Map(),
				unmountIds: currentUnmounts,
				stats: statState.isRecording ? createStats() : null,
			};

			if (commit.stats !== null) {
				commit.stats.unmounts += commit.unmountIds.length;
			}

			const unmounts = flush(commit);
			if (unmounts) {
				currentUnmounts = [];
				queue.push(unmounts);
			}
		});

		filters.regex = nextFilters.regex;
		filters.type = nextFilters.type;

		roots.forEach(root => {
			const commit = createCommit(
				host,
				roots,
				root,
				filters,
				profiler,
				statState,
			);
			const ev = flush(commit);
			if (!ev) return;
			queue.push(ev);
		});

		if (host.flushInitial) {
			host.flushInitial();
		}

		queue.forEach(ev => port.send(ev.type, ev.data));
	}

	return {
		hasId: host.hasId,
		log: host.log,
		flushInitial() {
			if (host.flushInitial) {
				host.flushInitial();
			}
		},
		getDisplayName: host.getDisplayName,
		inspect: host.inspect,
		onCommit(node: T) {
			const commit = createCommit(
				host,
				roots,
				node,
				filters,
				profiler,
				statState,
			);

			if (commit.stats !== null) {
				commit.stats.unmounts += currentUnmounts.length;
			}

			commit.unmountIds.push(...currentUnmounts);
			currentUnmounts = [];
			const ev = flush(commit);
			if (!ev) return;

			if (profiler.updateRects.size > 0) {
				startDrawing(profiler.updateRects);
				profiler.pendingHighlightUpdates.clear();
			}

			port.send(ev.type as any, ev.data);
		},
		onUnmount,

		clear() {
			roots.forEach(vnode => {
				onUnmount(vnode);
			});
		},
		refresh() {
			applyFilters(filters);
		},
		applyFilters,

		// Profiler
		startHighlightUpdates() {
			profiler.highlightUpdates = true;
		},
		stopHighlightUpdates() {
			profiler.highlightUpdates = false;
			profiler.updateRects.clear();
			profiler.pendingHighlightUpdates.clear();
		},
		startProfiling: (options: ProfilerOptions) => {
			profiler.isProfiling = true;
			profiler.captureRenderReasons =
				!!options && !!options.captureRenderReasons;
		},
		stopProfiling: () => {
			profiler.isProfiling = false;
		},

		// Stats
		startRecordStats: () => {
			statState.isRecording = true;
		},
		stopRecordStats: () => {
			statState.isRecording = false;
		},
	};
}
