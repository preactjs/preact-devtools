import { useCallback } from "preact/hooks";
import { ID } from "../../store";

export interface ListAdapter {
	selected: ID;
	canCollapse: (id: ID) => boolean;
	checkCollapssed: (id: ID) => boolean;
	onPrev: (current: ID) => void;
	onNext: (current: ID) => void;
	onCollapse: (id: ID, open: boolean) => void;
}

export function useKeyListNav(opts: ListAdapter) {
	return useCallback(
		(e: KeyboardEvent) => {
			if (/^Arrow/.test(e.key)) e.preventDefault();

			const sel = opts.selected;
			const { onCollapse, canCollapse, checkCollapssed, onPrev, onNext } = opts;
			if (e.key === "ArrowLeft") {
				if (canCollapse(sel) && !checkCollapssed(sel)) {
					return onCollapse(sel, true);
				}
				onPrev(sel);
			} else if (e.key === "ArrowUp") {
				onPrev(sel);
			} else if (e.key === "ArrowRight") {
				if (canCollapse(sel) && checkCollapssed(sel)) {
					return onCollapse(sel, false);
				}
				onNext(sel);
			} else if (e.key === "ArrowDown") {
				onNext(sel);
			}
		},
		[opts.selected],
	);
}
