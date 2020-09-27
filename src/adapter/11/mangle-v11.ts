import { Internal } from "./shapes-v11";

export function getChildren(internal: Internal): Internal[] {
	return internal._children;
}

export function getParent(internal: Internal): Internal | null {
	return internal._parentInternal;
}

export function getFlags(internal: Internal) {
	return internal._flags;
}
