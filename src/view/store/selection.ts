import { AppCtx } from "./react-bindings";
import { signal, Signal } from "@preact/signals";
import { clamp } from "../components/tree/windowing";
import { useContext } from "preact/hooks";
import { ID } from "./types";
import { TreeStore } from "./tree";

/**
 * Manages selection state of the TreeView.
 */
export function createSelectionStore(list: Signal<ID[]>, tree?: TreeStore) {
	const selected = signal<ID>(list.value.length > 0 ? list.value[0] : -1);
	const selectedIdx = signal(0);

	const selectByIndex = (idx: number) => {
		if (tree && tree.visibleSize() > 0) {
			const n = clamp(idx, tree.visibleSize() - 1);
			selected.value = tree.visibleAt(n) ?? -1;
			selectedIdx.value = n;
			return;
		}

		const n = clamp(idx, list.value.length - 1);
		selected.value = list.value[n] ?? -1;
		selectedIdx.value = n;
	};

	const selectNext = () => selectByIndex(selectedIdx.value + 1);
	const selectPrev = () => selectByIndex(selectedIdx.value - 1);

	const selectById = (id: ID) => {
		const idx = tree ? tree.rankOf(id) : list.value.findIndex(x => x === id);
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
