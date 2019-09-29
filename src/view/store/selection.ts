import { ID, Listener, AppCtx, useObserver } from ".";
import { valoo, Observable, watch } from "../valoo";
import { clamp } from "../components/tree/windowing";
import { useContext } from "preact/hooks";

/**
 * Manages selection state of the TreeView.
 */
export function createSelectionStore(list: Observable<ID[]>, notify: Listener) {
	const selected = valoo<ID>(list.$.length > 0 ? list.$[0] : -1);
	const selectedIdx = valoo(0);

	const selectByIndex = (idx: number) => {
		let n = clamp(idx, list.$.length - 1);
		selected.$ = list.$[n];
		selectedIdx.$ = n;
	};

	const selectNext = () => selectByIndex(selectedIdx.$ + 1);
	const selectPrev = () => selectByIndex(selectedIdx.$ - 1);

	const selectById = (id: ID) => {
		const idx = list.$.findIndex(x => x === id);
		selectByIndex(idx);
	};

	// Whenever the selection changes we need to fire a request to
	// load the prop data for the sidebar
	watch(() => {
		if (selected.$ > -1) {
			notify("inspect", selected.$);
		}
	});

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
