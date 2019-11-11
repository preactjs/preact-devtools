import { VNode } from "preact";
import { getComponent, getDom, getDisplayName } from "./vnode";

export interface IdMapper {
	getVNode(id: number): VNode | null;
	has(id: number): boolean;
	hasId(vnode: VNode): boolean;
	createId(vnode: VNode): number;
	getId(vnode: VNode): number;
	update(id: number, vnode: VNode): void;
	remove(vnode: VNode): void;
}

/**
 * VNode relationships are encoded as simple numbers for the devtools. We use
 * this function to keep track of existing id's and create new ones if needed.
 */
export function createIdMapper(): IdMapper {
	const instToId = new Map<any, number>();
	const idToVNode = new Map<number, VNode>();
	const idToInst = new Map<number, any>();

	let uuid = 1;

	const getVNode = (id: number) => idToVNode.get(id) || null;
	const hasId = (vnode: VNode) => {
		if (vnode != null) {
			return instToId.has(getInstance(vnode));
		}
		return false;
	};
	const getId = (vnode: VNode) => {
		if (vnode == null) return -1;
		const inst = getInstance(vnode);
		return instToId.get(inst) || -1;
	};
	const update = (id: number, vnode: VNode) => {
		const inst = getInstance(vnode);
		idToInst.set(id, inst);
		idToVNode.set(id, vnode);
	};
	const remove = (vnode: VNode) => {
		if (hasId(vnode)) {
			const id = getId(vnode);
			idToInst.delete(id);
			idToVNode.delete(id);
		}
		const inst = getInstance(vnode);
		instToId.delete(inst);
	};
	const createId = (vnode: VNode) => {
		const id = uuid++;
		const inst = getInstance(vnode);
		instToId.set(inst, id);
		idToInst.set(id, inst);
		idToVNode.set(id, vnode);
		return id;
	};

	const has = (id: number) => idToInst.has(id);

	return { has, update, getVNode, hasId, createId, getId, remove };
}

// FIXME: Preact 10 specific
export function getInstance(vnode: VNode): any {
	// For components we use the instance to check refs, otherwise
	// we'll use a dom node
	if (typeof vnode.type === "function") {
		return getComponent(vnode);
	}

	return getDom(vnode);
}
