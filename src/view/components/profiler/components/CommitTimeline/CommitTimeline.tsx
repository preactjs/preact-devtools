import { h, RefObject } from "preact";
import { useState, useCallback, useRef, useEffect } from "preact/hooks";
import { ArrowBack, ArrowForward } from "../../../icons";
import s from "./CommitTimeline.css";
import { getGradient } from "../../data/gradient";
import { useResize } from "../../../utils";

function calcSize(
	container: RefObject<HTMLDivElement>,
	inner: RefObject<HTMLDivElement>,
	pane: RefObject<HTMLDivElement>,
	paneContainer: RefObject<HTMLDivElement>,
	count: number,
	selected: number,
) {
	if (
		container.current &&
		inner.current &&
		paneContainer.current &&
		pane.current
	) {
		if (count > 0) {
			const org = paneContainer.current.style.width;
			paneContainer.current.style.width = "0";

			const style = window.getComputedStyle(pane.current.firstElementChild!);
			const min = +style.getPropertyValue("min-width").replace("px", "");
			const max = +style.getPropertyValue("max-width").replace("px", "");

			const sibling = pane.current.firstElementChild!
				? pane.current.firstElementChild!.nextElementSibling!
				: null;
			const gap = sibling
				? +window
						.getComputedStyle(sibling)
						.getPropertyValue("margin-left")
						.replace("px", "")
				: 0;

			const full = container.current.offsetWidth;
			const ui = inner.current.offsetWidth;
			const available = full - ui - 1; // -1 to prevent layout glitch in chrome

			const itemWidth = Math.max(
				min,
				Math.min(Math.floor(available - (count - 1) * gap) / count, max),
			);
			const paneWidth = itemWidth * count + (count - 1) * gap;
			const viewport = available > paneWidth ? paneWidth : available;

			const selOffset = itemWidth * (selected + 1) + selected * gap;
			const offset =
				selOffset > viewport
					? Math.min(
							viewport - selOffset - (selected < count - 1 ? itemWidth / 2 : 0),
							paneWidth - viewport,
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  )
					: 0;

			paneContainer.current.style.width = org;

			return {
				item: itemWidth,
				pane: paneWidth,
				viewport,
				offset,
			};
		}
	}

	return { viewport: 0, pane: 0, item: 0, offset: 0 };
}

export interface CommitTimelineProps {
	selected: number;
	items: number[];
	onChange: (i: number) => void;
}

export function CommitTimeline(props: CommitTimelineProps) {
	const { items, onChange, selected } = props;

	const [viewportWidth, setViewportWidth] = useState(0);
	const [paneWidth, setPaneWidth] = useState(0);
	const [offset, setOffset] = useState(0);

	const container = useRef<HTMLDivElement>();
	const inner = useRef<HTMLDivElement>();
	const pane = useRef<HTMLDivElement>();
	const paneContainerRef = useRef<HTMLDivElement>();

	useEffect(() => {
		if (pane.current) {
			const active = pane.current.querySelector("[data-selected]");
			// JSDOM doesn't support scrollIntoView
			if (active && active.scrollIntoView) active.scrollIntoView();
		}
	}, [selected]);

	useResize(
		() => {
			const sizes = calcSize(
				container,
				inner,
				pane,
				paneContainerRef,
				items.length,
				selected,
			);
			setPaneWidth(sizes.pane);
			setViewportWidth(sizes.viewport);
			setOffset(sizes.offset);
		},
		[pane, container, paneContainerRef, inner, items.length, selected],
		true,
	);

	const onPrev = useCallback(() => {
		const next = selected - 1;
		onChange(next < 0 ? items.length - 1 : next);
	}, [selected]);

	const onNext = useCallback(() => {
		const next = selected + 1;
		onChange(next > items.length - 1 ? 0 : next);
	}, [selected]);

	if (items.length === 0) {
		return null;
	}

	const selectedCount = "" + (selected + 1);
	const itemsCountLen = ("" + items.length).length;
	const leading = selectedCount.padStart(itemsCountLen, "0");

	return (
		<div class={s.root} ref={container}>
			<div class={s.inner} ref={inner}>
				<div class={s.legend}>
					<span class={s.hidden}>
						{leading.slice(0, itemsCountLen - selectedCount.length)}
					</span>
					{selected + 1} / {items.length}
				</div>
				<button
					disabled={items.length <= 1}
					onClick={onPrev}
					class={s.navBtn}
					data-testid="prev-commit"
				>
					<ArrowBack />
				</button>
				<div
					class={s.itemContainer}
					ref={paneContainerRef}
					style={`width: ${viewportWidth}px`}
				>
					<div
						class={s.items}
						ref={pane}
						style={`width: ${paneWidth}px; transform: translate3d(${offset}px, 0, 0);`}
					>
						{items.map((x, i) => {
							return (
								<CommitItem
									key={x}
									onClick={() => onChange(i)}
									selected={i === selected}
									percent={x}
								/>
							);
						})}
					</div>
				</div>
				<button
					disabled={items.length <= 1}
					onClick={onNext}
					class={s.navBtn}
					data-testid="next-commit"
				>
					<ArrowForward />
				</button>
			</div>
		</div>
	);
}

export interface CommitItem {
	percent: number;
	onClick: () => void;
	selected?: boolean;
}

export function CommitItem(props: CommitItem) {
	const { percent } = props;
	const top = Math.max(20, Math.min(86, 100 - percent));
	const color = getGradient(100, percent);

	return (
		<div
			data-testid="commit-item"
			class={s.item}
			data-selected={props.selected}
			data-weight={color}
			onClick={props.onClick}
		>
			<div class={s.itemInner} style={`top: ${top}%`} />
		</div>
	);
}
