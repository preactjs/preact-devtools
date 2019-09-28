import { VNode } from "preact";
import { getComponent, getDom } from "./vnode";

export interface IdMapper {
	getVNode(id: number): VNode | null;
	has(id: number): boolean;
	hasId(vnode: VNode): boolean;
	createId(vnode: VNode): number;
	getId(vnode: VNode): number;
	remove(vnode: VNode): void;
	getByDom(node: HTMLElement | Text): number;
}

/**
 * VNode relationships are encoded as simple numbers for the devtools. We use
 * this function to keep track of existing id's and create new ones if needed.
 */
export function createIdMapper(): IdMapper {
	const instToId = new WeakMap<any, number>();
	const idToVNode = new Map<number, VNode>();
	const idToInst = new Map<number, any>();
	const domToId = new WeakMap<HTMLElement | Text, number>();

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
		const id = instToId.get(inst) || -1;
		if (id > -1) idToVNode.set(id, vnode);
		return id;
	};
	const remove = (vnode: VNode) => {
		if (hasId(vnode)) {
			const id = getId(vnode);
			idToInst.delete(id);
		}
		instToId.delete(vnode);
		const dom = getDom(vnode);
		if (typeof vnode.type !== "function" && dom != null) {
			domToId.delete(dom);
		}
	};
	const createId = (vnode: VNode) => {
		const id = uuid++;
		instToId.set(getInstance(vnode), id);
		idToInst.set(id, getInstance(vnode));
		idToVNode.set(id, vnode);
		const dom = getDom(vnode);
		if (typeof vnode.type !== "function" && dom != null) {
			domToId.set(dom, id);
		}
		return id;
	};

	const has = (id: number) => idToInst.has(id);

	const getByDom = (node: HTMLElement | Text) => {
		return domToId.get(node) || -1;
	};

	return { has, getVNode, hasId, createId, getId, remove, getByDom };
}

export function getInstance(vnode: VNode): any {
	// For components we use the instance to check refs, otherwise
	// we'll use a dom node
	if (typeof vnode.type === "function") {
		return getComponent(vnode);
	}

	return getDom(vnode);
}
