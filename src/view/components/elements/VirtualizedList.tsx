import { RefObject, VNode } from "preact";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "preact/hooks";
import { useResize } from "../utils";

export interface VirtualizedListProps<T> {
	items?: T[];
	itemCount?: number;
	itemAt?: (idx: number) => T | null;
	itemIndex?: (item: T) => number;
	container: RefObject<Element | null>;
	rowHeight: number;
	minBufferCount: number;
	renderRow: (item: T, idx: number, top: number) => any;
}

export function useVirtualizedList<T>({
	rowHeight,
	minBufferCount,
	items = [],
	itemCount = items.length,
	itemAt = idx => items[idx],
	itemIndex = item => items.findIndex(t => t === item),
	container,
	renderRow,
}: VirtualizedListProps<T>) {
	const [height, setHeight] = useState(0);
	const [scroll, setScroll] = useState(0);
	const measure = useCallback(() => {
		const el = container.current;
		if (!el) return;

		const nextHeight = el.clientHeight;
		setHeight(prev => (prev === nextHeight ? prev : nextHeight));

		const maxScroll = Math.max(0, Math.floor(rowHeight * itemCount - nextHeight));
		setScroll(prev => (prev > maxScroll ? maxScroll : prev));
	}, [container, itemCount, rowHeight]);

	const bufferCount =
		height > 0
			? Math.max(minBufferCount, Math.ceil(height / rowHeight / 2))
			: minBufferCount;

	const startIdx = Math.max(0, Math.floor(scroll / rowHeight) - bufferCount);
	const endIdx = startIdx + Math.ceil(height / rowHeight) + bufferCount;

	// A bit hacky, we bascially want to ensure that `scrollToItem`
	// is ALWAYS stable
	const timeoutRef = useRef<any>(null);
	const scrollRef = useRef(scroll);
	const itemCountRef = useRef(itemCount);
	const itemIndexRef = useRef(itemIndex);
	const heightRef = useRef(height);
	scrollRef.current = scroll;
	itemCountRef.current = itemCount;
	itemIndexRef.current = itemIndex;
	heightRef.current = height;

	const scrollToItem = useCallback(
		(item: T) => {
			const scroll = scrollRef.current;
			const itemCount = itemCountRef.current;
			const itemIndex = itemIndexRef.current;
			const height = heightRef.current;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			const nextIdx = itemIndex(item);
			if (nextIdx < 0) return;

			// Check if the item we want to scroll to is already in view
			const pos = Math.floor(nextIdx * rowHeight);
			const EDGE = rowHeight / 2;
			const isBefore = scroll + EDGE > pos;
			const isAfter = scroll + height - EDGE < pos;
			if (isBefore || isAfter) {
				// Clamp to available range to avoid overflow
				const maxScroll = Math.floor(rowHeight * itemCount - height);
				const nextPos = Math.max(
					0,
					Math.min(isBefore ? pos : pos - height + rowHeight * 2, maxScroll),
				);

				// Debounce scroll to avoid flickering when quickly hovering
				// a bunch of elements
				timeoutRef.current = setTimeout(() => {
					if (container.current) {
						container.current.scrollTop = nextPos;
					}
				}, 100);
			}
		},
		[rowHeight],
	);

	useEffect(() => {
		const scrollFn = (e: Event) => {
			const top = (e.target as Element).scrollTop;
			// Ignore overscroll
			if (top >= 0) {
				setScroll(top);
			}
		};

		if (container.current) {
			container.current.addEventListener("scroll", scrollFn);
		}

		return () => {
			if (container.current) {
				container.current.removeEventListener("scroll", scrollFn);
			}
		};
	}, [container.current]);

	useLayoutEffect(() => {
		measure();
	}, [measure]);

	useLayoutEffect(() => {
		const el = container.current;
		if (!el || typeof ResizeObserver === "undefined") return;

		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [container.current, measure]);

	useResize(measure, [measure], true);

	const vnodes = useMemo(() => {
		const vnodes: VNode[] = [];
		let idx = startIdx;
		let top = startIdx * rowHeight;
		while (idx < itemCount && idx <= endIdx) {
			const item = itemAt(idx);
			if (item !== null) {
				vnodes.push(renderRow(item, idx, top));
			}
			top += rowHeight;
			idx++;
		}
		return vnodes;
	}, [endIdx, itemAt, itemCount, renderRow, rowHeight, startIdx]);

	return {
		containerHeight: rowHeight * itemCount,
		children: vnodes,
		scrollToItem,
	};
}
