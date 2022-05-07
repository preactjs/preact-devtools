import { ID } from "../../view/store/types";
import { SharedVNode } from "./bindings";

/**
 * VNode relationships are encoded as simple numbers for the devtools. We use
 * this function to keep track of existing id's and create new ones if needed.
 */
export interface IdMappingState<T> {
	instToId: Map<any, ID>;
	idToVNode: Map<ID, T>;
	idToInst: Map<ID, any>;
	nextId: ID;
	getInstance: (vnode: T) => any;
}

export function createIdMappingState<T extends SharedVNode>(
	initial: number,
	getInstance: (vnode: T) => any,
): IdMappingState<T> {
	return {
		instToId: new Map(),
		idToVNode: new Map(),
		idToInst: new Map(),
		nextId: initial,
		getInstance,
	};
}

export function getVNodeById<T>(state: IdMappingState<T>, id: ID): T | null {
	return state.idToVNode.get(id) || null;
}

export function hasVNodeId<T>(state: IdMappingState<T>, vnode: T) {
	return vnode != null && state.instToId.has(state.getInstance(vnode));
}

export function getVNodeId<T>(state: IdMappingState<T>, vnode: T) {
	if (vnode == null) return -1;
	const inst = state.getInstance(vnode);
	return state.instToId.get(inst) || -1;
}

export function getOrCreateVNodeId<T>(
	state: IdMappingState<T>,
	vnode: T,
): number {
	const id = getVNodeId(state, vnode);
	if (id !== -1) return id;
	return createVNodeId(state, vnode);
}

export function updateVNodeId<T>(state: IdMappingState<T>, id: ID, vnode: T) {
	const inst = state.getInstance(vnode);
	state.idToInst.set(id, inst);
	state.idToVNode.set(id, vnode);
}

export function removeVNodeId<T>(state: IdMappingState<T>, vnode: T) {
	if (hasVNodeId(state, vnode)) {
		const id = getVNodeId(state, vnode);
		state.idToInst.delete(id);
		state.idToVNode.delete(id);
	}
	const inst = state.getInstance(vnode);
	state.instToId.delete(inst);
}

export function createVNodeId<T>(state: IdMappingState<T>, vnode: T) {
	const id = state.nextId++;
	const inst = state.getInstance(vnode);
	state.instToId.set(inst, id);
	state.idToInst.set(id, inst);
	state.idToVNode.set(id, vnode);
	return id;
}
