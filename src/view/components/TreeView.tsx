import { h } from "preact";
import s from "./Tree.css";
import { ID, useObserver, useStore } from "../store";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import { getLastChild } from "./tree/windowing";
import { useKeyListNav } from "./tree/keyboard";
import { useSelection } from "../store/selection";
import { useCollapser } from "../store/collapser";

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
			onMouseLeave={onMouseLeave}
		>
			{nodeList.map(id => (
				<TreeItem key={id} id={id} />
			))}
			<HighlightPane treeDom={ref.current} />
		</div>
	);
}

export function TreeItem(props: { key: any; id: ID }) {
	const { id } = props;
	const store = useStore();
	const sel = useSelection();
	const { collapsed, toggle } = useCollapser();
	const node = useObserver(() => store.nodes.$.get(id) || null);
	const onToggle = () => toggle(id);

	if (!node) return null;

	return (
		<div
			class={s.item}
			onClick={() => sel.selectById(id)}
			onMouseEnter={() => store.actions.highlightNode(id)}
			data-selected={sel.selected === id}
			data-id={id}
			data-depth={node.depth}
			style={`padding-left: calc(var(--indent-depth) * ${node.depth - 1})`}
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
				<span class={s.name}>{node.name}</span>
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
		}
	}, [selected]);

	return (
		<div
			class={s.dimmer}
			style={`top: ${pos.top}px; height: ${pos.height}px;`}
		/>
	);
}
