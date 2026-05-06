import { AppCtx } from "./react-bindings";
import { signal } from "@preact/signals";
import { clamp } from "../components/tree/windowing";
import { useContext } from "preact/hooks";
import { ID } from "./types";
import { TreeStore } from "./tree";

/**
 * Manages selection state of the TreeView.
 */
export function createSelectionStore(tree: TreeStore) {
	const selected = signal<ID>(-1);
	const selectedIdx = signal(0);

	const selectByIndex = (idx: number) => {
		if (tree.visibleSize() > 0) {
			const n = clamp(idx, tree.visibleSize() - 1);
			selected.value = tree.visibleAt(n) ?? -1;
			selectedIdx.value = n;
			return;
		}

		selected.value = -1;
		selectedIdx.value = -1;
	};

	const selectNext = () => selectByIndex(selectedIdx.value + 1);
	const selectPrev = () => selectByIndex(selectedIdx.value - 1);

	const selectById = (id: ID) => {
		const idx = tree.rankOf(id);
		selectByIndex(idx);
	};

	return {
		selected,
		selectedIdx,
		selectByIndex,
		selectById,
		selectNext,
		selectPrev,
	};
}

export function useSelection() {
	const sel = useContext(AppCtx).selection;
	const selected = sel.selected.value;
	const selectedIdx = sel.selectedIdx.value;
	return {
		selected,
		selectedIdx,
		selectByIndex: sel.selectByIndex,
		selectById: sel.selectById,
		selectPrev: sel.selectPrev,
		selectNext: sel.selectNext,
	};
}
