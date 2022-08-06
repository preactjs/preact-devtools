import { valoo } from "../../../../valoo";

export type DragTarget = "none" | "marker-left" | "marker-right" | "pane";

export function newMinimapState() {
	const left = valoo(0); // percent
	const right = valoo(100); // percent
	const viewport = valoo({
		left: 0,
		right: 1,
	});
	const target = valoo<DragTarget>("none");

	return { left, right, viewport, target };
}

export type MinimapState = ReturnType<typeof newMinimapState>;

export function worldToLocalPercent(state: MinimapState, x: number) {
	const { left, right } = state.viewport.$;
	const percent = Math.max(
		0,
		Math.min(100, (100 / (right - left)) * (x - left)),
	);

	return percent;
}
