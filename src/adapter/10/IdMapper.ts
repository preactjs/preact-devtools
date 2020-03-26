import { VNode } from "preact";
import { getComponent, getDom } from "./vnode";
import { ID } from "../../view/store/types";

/**
 * VNode relationships are encoded as simple numbers for the devtools. We use
 * this function to keep track of existing id's and create new ones if needed.
 */
export interface IdMappingState {
	instToId: Map<any, number>;
	idToVNode: Map<number, VNode>;
	idToInst: Map<number, any>;
	nextId: number;
}

export function createIdMappingState(): IdMappingState {
	return {
		instToId: new Map(),
		idToVNode: new Map(),
		idToInst: new Map(),
		nextId: 1,
	};
}

export function getVNodeById(state: IdMappingState, id: number) {
	return state.idToVNode.get(id) || null;
}

export function hasVNodeId(state: IdMappingState, vnode: VNode) {
	return vnode != null && state.instToId.has(getInstance(vnode));
}

export function getVNodeId(state: IdMappingState, vnode: VNode) {
	if (vnode == null) return -1;
	const inst = getInstance(vnode);
	return state.instToId.get(inst) || -1;
}

export function updateVNodeId(state: IdMappingState, id: ID, vnode: VNode) {
	const inst = getInstance(vnode);
	state.idToInst.set(id, inst);
	state.idToVNode.set(id, vnode);
}

export function removeVNodeId(state: IdMappingState, vnode: VNode) {
	if (hasVNodeId(state, vnode)) {
		const id = getVNodeId(state, vnode);
		state.idToInst.delete(id);
		state.idToVNode.delete(id);
	}
	const inst = getInstance(vnode);
	state.instToId.delete(inst);
}

export function createVNodeId(state: IdMappingState, vnode: VNode) {
	const id = state.nextId++;
	const inst = getInstance(vnode);
	state.instToId.set(inst, id);
	state.idToInst.set(id, inst);
	state.idToVNode.set(id, vnode);
	return id;
}

export function hasId(state: IdMappingState, id: ID) {
	return state.idToInst.has(id);
}

function getInstance(vnode: VNode): any {
	// For components we use the instance to check refs, otherwise
	// we'll use a dom node
	if (typeof vnode.type === "function") {
		return getComponent(vnode);
	}

	return getDom(vnode);
}
