import { RefObject } from "preact";
import {
	type Dispatch,
	type StateUpdater,
	useLayoutEffect,
	useRef,
	useState,
} from "preact/hooks";
import { useResize } from "../utils";

const INITIAL = 14;
const RIGHT_MARGIN = 16;
const MIN_HOC_INDENT = INITIAL / 2;
const HOC_BADGE_PADDING = 12;
const HOC_BADGE_CHAR_WIDTH = 7;
const HOC_GAP = 4;

interface RowMeasurement {
	fullWidth: number;
	compactWidth: number;
	hocCount: number;
	hocGap: number;
	firstHocWidth: number;
}

function getDigitCount(value: number) {
	if (value < 10) return 1;
	if (value < 100) return 2;
	if (value < 1000) return 3;

	let digits = 4;
	while (value >= 10000) {
		value /= 10;
		digits++;
	}
	return digits;
}

function getOverflowBadgeWidth(hiddenCount: number) {
	return (
		HOC_BADGE_PADDING + (getDigitCount(hiddenCount) + 1) * HOC_BADGE_CHAR_WIDTH
	);
}

function getRowMeasurement(
	cache: Map<string, RowMeasurement>,
	id: string,
	el: HTMLElement,
): RowMeasurement {
	const hocLabels = el.querySelector<HTMLElement>("[data-hoc-labels]");
	const hocCount = Number(hocLabels?.getAttribute("data-hoc-count") || 0);
	const visibleHocCount = Number(
		hocLabels?.getAttribute("data-hoc-visible") || hocCount,
	);
	const cached = cache.get(id);

	// Collapsed rows cannot be used to recompute the full label width. Keep the
	// previous full measurement until a full-label render refreshes the cache.
	if (cached && cached.hocCount === hocCount && visibleHocCount < hocCount) {
		return cached;
	}

	const fullWidth = el.offsetWidth + RIGHT_MARGIN;
	if (
		cached &&
		cached.hocCount === hocCount &&
		cached.fullWidth === fullWidth
	) {
		return cached;
	}

	let firstHocWidth = 0;
	let hocGap = HOC_GAP;

	if (hocLabels && hocCount > 0) {
		let firstHoc: HTMLElement | null = null;
		let secondHoc: HTMLElement | null = null;
		let child = hocLabels.firstElementChild as HTMLElement | null;
		while (child && !secondHoc) {
			if (child.getAttribute("data-hoc-kind") === "label") {
				if (!firstHoc) {
					firstHoc = child;
				} else {
					secondHoc = child;
				}
			}
			child = child.nextElementSibling as HTMLElement | null;
		}

		if (firstHoc) {
			firstHocWidth = firstHoc.offsetWidth;
		}
		if (firstHoc && secondHoc) {
			hocGap = Math.max(
				0,
				secondHoc.offsetLeft - firstHoc.offsetLeft - firstHoc.offsetWidth,
			);
		}
	}

	const baseWidth = hocLabels
		? Math.max(0, hocLabels.offsetLeft - el.offsetLeft + RIGHT_MARGIN)
		: fullWidth;
	const compactWidth =
		hocCount > 0
			? Math.min(fullWidth, baseWidth + getOverflowBadgeWidth(hocCount))
			: fullWidth;
	const measure = {
		fullWidth,
		compactWidth,
		hocCount,
		hocGap,
		firstHocWidth,
	};
	cache.set(id, measure);
	return measure;
}

export function useAutoIndent(
	container: RefObject<HTMLElement | null>,
	deps: any[],
	setHocLimits: Dispatch<StateUpdater<Map<number, number>>>,
) {
	const indent = useRef(INITIAL);
	const [available, setAvailable] = useState(0);
	const hocLimitsRef = useRef(new Map<number, number>());
	const cacheRef = useRef(new Map<string, RowMeasurement>());
	const nextHocLimitsRef = useRef(new Map<number, number>());

	const updateHocLimits = (next: Map<number, number>) => {
		const copy = new Map(next);
		hocLimitsRef.current = copy;
		setHocLimits(copy);
	};

	useResize(
		() => {
			indent.current = INITIAL;
			nextHocLimitsRef.current.clear();
			if (hocLimitsRef.current.size > 0) {
				updateHocLimits(nextHocLimitsRef.current);
			}
			if (container.current) {
				setAvailable(container.current.clientWidth);
			}
		},
		[],
		true,
	);

	useLayoutEffect(() => {
		if (container.current) {
			let space = available;
			if (available === 0) {
				space = container.current.clientWidth;
			}

			const cache = cacheRef.current;
			const { childNodes } = container.current;

			let nextIndent = indent.current;
			let fullIndent = indent.current;
			let compactIndent = indent.current;

			for (let i = 0; i < childNodes.length; i++) {
				const child = childNodes[i] as HTMLElement;
				if (!child) continue;

				const id = child.getAttribute("data-id");
				if (!id) continue;

				// Measure the actual first child
				const el = child.firstChild as HTMLElement;
				if (!el) continue;

				const depth = +(child.getAttribute("data-depth") || 0);
				if (depth <= 0) continue;

				const measure = getRowMeasurement(cache, id, el);
				fullIndent = Math.min(
					fullIndent,
					Math.max(0, (space - measure.fullWidth) / depth),
				);
				compactIndent = Math.min(
					compactIndent,
					Math.max(0, (space - measure.compactWidth) / depth),
				);
				nextIndent = fullIndent;
			}

			const currentHocLimits = hocLimitsRef.current;
			const nextHocLimits = nextHocLimitsRef.current;
			nextHocLimits.clear();
			let hocLimitsChanged = false;
			if (fullIndent < MIN_HOC_INDENT && compactIndent > fullIndent) {
				nextIndent = Math.min(INITIAL, compactIndent);

				for (let i = 0; i < childNodes.length; i++) {
					const child = childNodes[i] as HTMLElement;
					if (!child) continue;

					const id = child.getAttribute("data-id");
					if (!id) continue;

					const el = child.firstChild as HTMLElement;
					if (!el) continue;

					const depth = +(child.getAttribute("data-depth") || 0);
					if (depth <= 0) continue;

					const measure = getRowMeasurement(cache, id, el);
					if (measure.hocCount === 0) continue;
					if (measure.compactWidth >= measure.fullWidth) continue;
					if (depth * nextIndent + measure.fullWidth <= space) continue;

					const fullHocWidth = measure.fullWidth - measure.compactWidth;
					const firstAndBadgeDelta =
						measure.firstHocWidth +
						measure.hocGap +
						getOverflowBadgeWidth(measure.hocCount - 1) -
						getOverflowBadgeWidth(measure.hocCount);
					const availableHocDelta =
						space - depth * nextIndent - measure.compactWidth;
					const visible =
						measure.hocCount > 1 &&
						firstAndBadgeDelta <= availableHocDelta &&
						firstAndBadgeDelta < fullHocWidth
							? 1
							: 0;

					const nodeId = +id;
					if (currentHocLimits.get(nodeId) !== visible) {
						hocLimitsChanged = true;
					}
					nextHocLimits.set(nodeId, visible);
				}
			}

			container.current.style.setProperty("--indent-depth", `${nextIndent}px`);
			indent.current = nextIndent;
			if (hocLimitsChanged || nextHocLimits.size !== currentHocLimits.size) {
				updateHocLimits(nextHocLimits);
			}
		}
	}, [...deps, available]);

	return indent;
}
