import { AppCtx } from "./react-bindings";
import { valoo, Observable } from "../preact-signals";
import { clamp } from "../components/tree/windowing";
import { useContext } from "preact/hooks";
import { ID } from "./types";

/**
 * Manages selection state of the TreeView.
 */
export function createSelectionStore(list: Observable<ID[]>) {
	const selected = valoo<ID>(list.$.length > 0 ? list.$[0] : -1);
	selected.name = "selected";
	const selectedIdx = valoo(0);
	selectedIdx.name = "selectedIdx";

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
	const selected = sel.selected.$;
	const selectedIdx = sel.selectedIdx.$;
	return {
		selected,
		selectedIdx,
		selectByIndex: sel.selectByIndex,
		selectById: sel.selectById,
		selectPrev: sel.selectPrev,
		selectNext: sel.selectNext,
	};
}
