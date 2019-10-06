import { h } from "preact";
import s from "./Tree.css";
import { useObserver, useStore } from "../store/react-bindings";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import { getLastChild } from "./tree/windowing";
import { useKeyListNav } from "./tree/keyboard";
import { useSelection } from "../store/selection";
import { useCollapser } from "../store/collapser";
import { BackgroundLogo } from "./tree/background-logo";
import { useSearch } from "../store/search";
import { scrollIntoView } from "./utils";
import { ID } from "../store/types";

export function TreeView() {
	const store = useStore();
	const nodeList = useObserver(() => store.nodeList.$);
	const { collapseNode, collapsed } = useCollapser();
	const { selected, selectNext, selectPrev } = useSelection();

	const onKeyDown = useKeyListNav({
		selected,
		onCollapse: collapseNode,
		canCollapse: id => {
			const node = store.nodes.$.get(id);
			return node ? node.children.length > 0 : false;
		},
		checkCollapsed: id => collapsed.has(id),
		onNext: selectNext,
		onPrev: selectPrev,
	});

	const onMouseLeave = useCallback(() => store.actions.highlightNode(null), []);
	const ref = useRef<HTMLDivElement | null>(null);
	return (
		<div
			ref={ref}
			tabIndex={0}
			class={s.tree}
			onKeyDown={onKeyDown}
			data-tree={true}
			onMouseLeave={onMouseLeave}
		>
			{nodeList.length === 0 && (
				<div class={s.empty}>
					<BackgroundLogo class={s.bgLogo} />
					<p>
						<b>Connected</b>, waiting for nodes to load...
					</p>
				</div>
			)}
			{nodeList.map(id => (
				<TreeItem key={id} id={id} />
			))}
			<HighlightPane treeDom={ref.current} />
		</div>
	);
}

export function MarkResult(props: { text: string; id: ID }) {
	const { regex, selectedId } = useSearch();
	let { text, id } = props;
	let isActive = id === selectedId;

	let ref = useRef<HTMLSpanElement>();
	useEffect(() => {
		if (ref.current && isActive) {
			scrollIntoView(ref.current);
		}
	}, [ref.current, selectedId, id]);

	if (regex != null && regex.test(text)) {
		let m = text.match(regex)!;
		let idx = m.index || 0;
		let start = idx > 0 ? text.slice(0, idx) : "";
		let end = idx < text.length ? text.slice(idx + m[0].length) : "";
		return (
			<span ref={ref}>
				{start}
				<mark class={`${s.mark} ${isActive ? s.markSelected : ""}`}>
					{m[0]}
				</mark>
				{end}
			</span>
		);
	}
	return <span>{text}</span>;
}

export function TreeItem(props: { key: any; id: ID }) {
	const { id } = props;
	const store = useStore();
	const sel = useSelection();
	const { collapsed, toggle } = useCollapser();
	const filterFragments = useObserver(() => store.filter.filterFragment.$);
	const node = useObserver(() => store.nodes.$.get(id) || null);
	const onToggle = () => toggle(id);
	const ref = useRef<HTMLDivElement>();

	let isSelected = sel.selected === id;
	useEffect(() => {
		if (ref.current && isSelected) {
			scrollIntoView(ref.current);
		}
	}, [ref.current, sel.selected, id]);

	if (!node) return null;

	return (
		<div
			ref={ref}
			class={s.item}
			onClick={() => sel.selectById(id)}
			onMouseEnter={() => store.actions.highlightNode(id)}
			data-selected={isSelected}
			data-id={id}
			data-depth={node.depth}
			style={`padding-left: calc(var(--indent-depth) * ${node.depth -
				(filterFragments ? 2 : 1)})`}
		>
			<div class={s.itemHeader}>
				{node.children.length > 0 && (
					<button
						class={s.toggle}
						data-collapsed={collapsed.has(id)}
						onClick={onToggle}
					>
						<Arrow />
					</button>
				)}
				{node.children.length === 0 && <div class={s.noToggle} />}
				<span class={s.name}>
					<MarkResult text={node.name} id={id} />
				</span>
			</div>
		</div>
	);
}

export function Arrow() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 4.233 4.233"
		>
			<path d="M1.124 1.627H3.11l-.992 1.191-.993-1.19" fill="currentColor" />
		</svg>
	);
}

export function HighlightPane(props: { treeDom: HTMLDivElement | null }) {
	const store = useStore();
	const nodes = useObserver(() => store.nodes.$);
	const { selected } = useSelection();
	const { collapsed } = useCollapser();

	// Subscribe to nodeList so that we rerender whenever nodes
	// are collapsed
	const list = useObserver(() => store.nodeList.$);

	let [pos, setPos] = useState({ top: 0, height: 0 });
	useEffect(() => {
		if (selected > -1 && !collapsed.has(selected)) {
			if (props.treeDom != null) {
				let start = props.treeDom.querySelector(
					`[data-id="${selected}"`,
				) as HTMLDivElement | null;
				let lastId = getLastChild(nodes, selected);
				let last = props.treeDom.querySelector(
					`[data-id="${lastId}"]`,
				) as HTMLDivElement | null;

				if (start != null && last != null) {
					const rect = start.getBoundingClientRect();
					const top = start.offsetTop + rect.height;
					const lastRect = last.getBoundingClientRect();
					let height = last.offsetTop + lastRect.height - top;
					setPos({ top, height });
				} else {
					setPos({ top: 0, height: 0 });
				}
			} else {
				setPos({ top: 0, height: 0 });
			}
		} else {
			setPos({ top: 0, height: 0 });
		}
	}, [selected, list]);

	return (
		<div
			class={s.dimmer}
			style={`top: ${pos.top}px; height: ${pos.height}px;`}
		/>
	);
}
