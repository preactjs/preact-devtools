import { VNode } from "./adapter";

export interface IdMapper {
	getVNode(id: number): VNode | null;
	hasId(vnode: VNode): boolean;
	createId(vnode: VNode): number;
	getId(vnode: VNode): number;
	remove(vnode: VNode): void;
}

/**
 * VNode relationships are encoded as simple numbers for the devtools. We use
 * this function to keep track of existing id's and create new ones if needed.
 */
export function createIdMapper(): IdMapper {
	const vnodeToId = new WeakMap<VNode, number>();
	const idToVNode = new Map<number, VNode>();
	// Must never be 0, otherwise an infinite loop will be trigger inside
	// the devtools extension ¯\_(ツ)_/¯
	let uuid = 1;

	const getVNode = (id: number) => idToVNode.get(id) || null;
	const hasId = (vnode: VNode) => {
		if (vnode != null) {
			if (vnodeToId.has(vnode)) return true;
			if (vnode.old != null) return vnodeToId.has(vnode.old);
		}
		return false;
	};
	const getId = (vnode: VNode) => {
		let id = -1;
		if (!vnodeToId.has(vnode)) {
			if (vnode.old != null && vnodeToId.has(vnode.old)) {
				id = vnodeToId.get(vnode.old)!;
				vnodeToId.set(vnode, id);
				idToVNode.set(id, vnode);
			}
		}
		return id;
	};
	const remove = (vnode: VNode) => {
		if (hasId(vnode)) {
			const id = getId(vnode);
			idToVNode.delete(id);
		}
		vnodeToId.delete(vnode);
	};
	const createId = (vnode: VNode) => {
		const id = uuid++;
		vnodeToId.set(vnode, id);
		idToVNode.set(id, vnode);
		return id;
	};

	return { getVNode, hasId, createId, getId, remove };
}
