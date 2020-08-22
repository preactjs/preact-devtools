import { RefObject, VNode } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

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

	useEffect(() => {
		const fn = () => {
			if (container.current) {
				setHeight(container.current.clientHeight);
			}
		};

		window.addEventListener("resize", fn);
		return () => window.removeEventListener("resize", fn);
	}, []);

	let idx = Math.floor(scroll / rowHeight) - bufferCount;
	const max = idx + Math.ceil(height / rowHeight) + bufferCount;
	let top = idx * rowHeight;

	console.log(top, scroll);
	const vnodes: VNode[] = [];
	while (idx <= max) {
		vnodes.push(renderRow(items[idx], idx, top));
		top += rowHeight;
		idx++;
	}

	return {
		containerHeight: rowHeight * items.length,
		children: vnodes,
	};
}
