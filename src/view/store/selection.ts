import { AppCtx, useObserver } from "./react-bindings";
import { signal, Signal } from "../valoo";
import { clamp } from "../components/tree/windowing";
import { useContext } from "preact/hooks";
import { ID } from "./types";

/**
 * Manages selection state of the TreeView.
 */
export function createSelectionStore(list: Signal<ID[]>) {
	const selected = signal<ID>(list.$.length > 0 ? list.$[0] : -1);
	const selectedIdx = signal(0);

	const selectByIndex = (idx: number) => {
		const n = clamp(idx, list.$.length - 1);
		selected.$ = list.$[n];
		selectedIdx.$ = n;
	};

	const selectNext = () => selectByIndex(selectedIdx.$ + 1);
	const selectPrev = () => selectByIndex(selectedIdx.$ - 1);

	const selectById = (id: ID) => {
		const idx = list.$.findIndex(x => x === id);
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
	const selected = useObserver(() => sel.selected.$);
	const selectedIdx = useObserver(() => sel.selectedIdx.$);
	return {
		selected,
		selectedIdx,
		selectByIndex: sel.selectByIndex,
		selectById: sel.selectById,
		selectPrev: sel.selectPrev,
		selectNext: sel.selectNext,
	};
}
