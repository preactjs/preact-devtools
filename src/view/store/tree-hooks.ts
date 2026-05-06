import { ID } from "./types";
import { useStore } from "./react-bindings";

export function useTreeStructureVersion() {
	const store = useStore();
	return store.tree.structureVersion.value;
}

export function useTreeNodeVersion(id: ID) {
	const store = useStore();
	return id === -1 ? 0 : store.tree.versionOfNode(id).value;
}
