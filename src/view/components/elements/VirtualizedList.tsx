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
	items: T[];
	container: RefObject<Element>;
	rowHeight: number;
	bufferCount: number;
	renderRow: (item: T, idx: number, top: number) => any;
}

export function useVirtualizedList<T>({
	rowHeight,
	bufferCount,
	items,
	container,
	renderRow,
}: VirtualizedListProps<T>) {
	const [height, setHeight] = useState(0);
	const [scroll, setScroll] = useState(0);

	let idx = Math.max(0, Math.floor(scroll / rowHeight) - bufferCount);
	const max = idx + Math.ceil(height / rowHeight) + bufferCount;
	let top = idx * rowHeight;

	const timeoutRef = useRef<any>(null);
	const scrollToItem = useCallback(
		(item: T) => {
			const nextIdx = items.findIndex(t => t === item);
			if (nextIdx < 0) return;

			const pos = Math.floor(nextIdx * rowHeight);
			if (top > pos || max < pos) {
				// Clamp to available range to avoid overflow
				const maxScroll = Math.floor(rowHeight * items.length - height);
				const nextPos = Math.max(0, Math.min(pos, maxScroll));

				// Debounce scroll to avoid flickering when quickly hovering
				// a bunch of elements
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
				timeoutRef.current = setTimeout(() => {
					if (container.current) {
						container.current.scrollTop = nextPos;
					}
				}, 100);
			}
		},
		[items],
	);

	useLayoutEffect(() => {
		if (container.current) {
			setHeight(container.current.clientHeight);
		}
	}, []);

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

	useResize(() => {
		if (container.current) {
			setHeight(container.current.clientHeight);
		}
	}, []);

	const vnodes = useMemo(() => {
		const vnodes: VNode[] = [];
		while (idx < items.length && idx <= max) {
			vnodes.push(renderRow(items[idx], idx, top));
			top += rowHeight;
			idx++;
		}
		return vnodes;
	}, [items, idx, max, top]);

	return {
		containerHeight: rowHeight * items.length,
		children: vnodes,
		scrollToItem,
	};
}
