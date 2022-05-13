import { ID } from "../../view/store/types";
import { UpdateRects } from "./highlightUpdates";

export interface ProfilerState {
	isProfiling: boolean;
	highlightUpdates: boolean;
	pendingHighlightUpdates: Set<HTMLElement>;
	updateRects: UpdateRects;
	captureRenderReasons: boolean;
	recordStats: boolean;
	selfDurations: Map<ID, number>;
}

export function newProfiler(): ProfilerState {
	return {
		highlightUpdates: false,
		updateRects: new Map(),
		pendingHighlightUpdates: new Set(),
		captureRenderReasons: false,
		isProfiling: false,
		recordStats: false,
		selfDurations: new Map(),
	};
}
