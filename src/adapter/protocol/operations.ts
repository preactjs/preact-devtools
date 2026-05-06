import { DevNode, ID, Tree } from "../../view/store/types";
import type { TreeSyncChanges } from "../../view/store/tree";
import { parseTable } from "./string-table";
import { MsgTypes } from "./events";
import { RenderReasonMap } from "../shared/renderReasons";
import { ParsedStats, parseStats } from "../shared/stats";

function cloneNode(node: DevNode): DevNode {
	return {
		children: node.children.slice(),
		depth: node.depth,
		endTime: node.endTime,
		hocs: node.hocs === null ? null : node.hocs.slice(),
		id: node.id,
		key: node.key,
		name: node.name,
		owner: node.owner,
		parent: node.parent,
		startTime: node.startTime,
		type: node.type,
	};
}

/**
 * This is the heart of the devtools. Here we translate incoming events
 * and construct the tree data structure which all operations in the
 * Devtools UI are based upon.
 *
 * We currently expect all operations to be in order.
 */
export function ops2Tree(
	oldTree: Tree,
	existingRoots: ID[],
	ops: number[],
	mutate = false,
) {
	const pending: Tree = mutate ? oldTree : new Map(oldTree);
	const rootId = ops[0];
	const roots: ID[] = [...existingRoots];
	const removals: ID[] = [];
	const dirty = new Set<ID>();
	const removed = new Set<ID>();
	const added = new Set<ID>();
	const removedParents = new Map<ID, ID>();
	const rendered = new Set<ID>();
	const reasons: RenderReasonMap = new Map();
	let stats: ParsedStats | null = null;
	let structural = false;

	let i = ops[1] + 1;
	const strings = parseTable(ops.slice(1, i + 1));

	for (i += 1; i < ops.length; i++) {
		switch (ops[i]) {
			case MsgTypes.ADD_ROOT:
				if (roots.indexOf(ops[i + 1]) === -1) {
					roots.push(ops[i + 1]);
					structural = true;
				}
				i += 1;
				break;
			case MsgTypes.ADD_VNODE: {
				const id = ops[i + 1];
				const parentId = ops[i + 3];
				const parent = pending.get(parentId);
				if (parent) {
					const clone = cloneNode(parent);
					pending.set(parent.id, clone);
					clone.children.push(id);
					dirty.add(parent.id);
				}

				pending.set(id, {
					children: [],
					depth: parent ? parent.depth + 1 : 0,
					id,
					hocs: null,
					name: strings[ops[i + 5] - 1],
					owner: ops[i + 4],
					parent: parentId,
					type: ops[i + 2],
					key: ops[i + 6] > 0 ? strings[ops[i + 6] - 1] : "",
					startTime: ops[i + 7] / 1000,
					endTime: ops[i + 8] / 1000,
				});

				rendered.add(id);
				dirty.add(id);
				added.add(id);
				structural = true;

				i += 8;
				break;
			}
			case MsgTypes.UPDATE_VNODE_TIMINGS: {
				const id = ops[i + 1];
				pending.set(id, cloneNode(pending.get(id)!));
				const x = pending.get(id)!;
				x.startTime = ops[i + 2] / 1000;
				x.endTime = ops[i + 3] / 1000;

				rendered.add(id);

				i += 3;
				break;
			}
			case MsgTypes.REMOVE_VNODE: {
				const unmounts = ops[i + 1];
				i += 2;
				const len = i + unmounts;
				for (; i < len; i++) {
					const nodeId = ops[i];
					removals.push(nodeId);
					const node = pending.get(nodeId);
					if (node) {
						// Remove node from parent children array
						const parent = pending.get(node.parent);
						if (parent) {
							const idx = parent.children.indexOf(nodeId);
							if (idx > -1) {
								const clone = cloneNode(parent);
								pending.set(parent.id, clone);
								clone.children.splice(idx, 1);
								dirty.add(parent.id);
								structural = true;
							}
						}

						// Check if node was a root
						const rootIdx = roots.indexOf(node.id);
						if (rootIdx > -1) {
							roots.splice(rootIdx, 1);
							structural = true;
						}

						// Delete children recursively
						const stack = [node.id];
						let item;
						while ((item = stack.pop())) {
							const child = pending.get(item);
							if (!child) continue;

							removedParents.set(child.id, child.parent);
							pending.delete(child.id);
							dirty.add(child.id);
							removed.add(child.id);
							stack.push(...child.children);
						}

						pending.delete(nodeId);
					}
				}

				// Subtract one because of outer loop
				if (len > 0) i--;
				break;
			}
			case MsgTypes.REORDER_CHILDREN: {
				const parentId = ops[i + 1];
				const count = ops[i + 2];
				const parent = cloneNode(pending.get(parentId)!);
				const children = ops.slice(i + 3, i + 3 + count);
				if (!sameIds(parent.children, children)) {
					parent.children = children;
					dirty.add(parentId);
					structural = true;
				}
				pending.set(parentId, parent);
				i = i + 2 + count;
				break;
			}
			case MsgTypes.RENDER_REASON: {
				const id = ops[i + 1];
				const type = ops[i + 2];
				const count = ops[i + 3];
				let items: string[] | null = null;
				if (count > 0) {
					items = ops.slice(i + 4, i + 4 + count).map(x => strings[x - 1]);
				}
				reasons.set(id, {
					type,
					items,
				});
				i = i + 3 + count;
				break;
			}
			case MsgTypes.COMMIT_STATS: {
				const statsData = parseStats(i + 1, ops);
				i = statsData.i;
				stats = statsData.stats;
				break;
			}
			case MsgTypes.HOC_NODES: {
				const vnodeId = ops[i + 1];
				const vnode = pending.get(vnodeId);
				const count = ops[i + 2];
				if (vnode) {
					const clone = cloneNode(vnode);
					pending.set(vnodeId, clone);
					const hocs = [];
					for (let j = 0; j < count; j++) {
						hocs.push(strings[ops[i + 3 + j] - 1]);
					}
					clone.hocs = hocs;
					dirty.add(vnodeId);
				}
				i = i + 2 + count;
				break;
			}
			default:
				throw new Error("Unknown event: " + ops[i]);
		}
	}

	const addedSubtreeRoots: ID[] = [];
	added.forEach(id => {
		const node = pending.get(id);
		if (node && !added.has(node.parent)) {
			addedSubtreeRoots.push(id);
		}
	});

	const removedSubtreeRoots: Array<{ id: ID; parent: ID }> = [];
	removed.forEach(id => {
		const parent = removedParents.get(id);
		if (parent !== undefined && !removed.has(parent)) {
			removedSubtreeRoots.push({ id, parent });
		}
	});

	const changes: TreeSyncChanges = {
		dirty: Array.from(dirty),
		addedSubtreeRoots,
		removed: Array.from(removed),
		removedSubtreeRoots,
		structural,
		incremental: true,
	};

	return {
		rootId,
		roots,
		tree: pending,
		removals,
		rendered,
		reasons,
		stats,
		changes,
	};
}

function sameIds(a: ID[], b: ID[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
