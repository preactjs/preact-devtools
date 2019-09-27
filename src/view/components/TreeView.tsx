import { h } from "preact";
import s from "./Tree.css";
import { ID, useObserver, useStore } from "../store";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import { getLastChild, clamp } from "./tree/windowing";
import { useKeyListNav } from "./tree/keyboard";

export function TreeView() {
	const store = useStore();
	const nodeList = useObserver(() => store.nodeList.$);
	const selected = useObserver(() => store.selected.$);
	const selectedIdx = useObserver(() => store.selectedIdx.$);

	const onKeyDown = useKeyListNav({
		selected,
		onCollapse: store.actions.collapseNode,
		canCollapse: id => {
			const node = store.nodes.$.get(id);
			return node ? node.children.length > 0 : false;
		},
		checkCollapssed: id => store.visiblity.collapsed.$.has(id),
		onNext: () => {
			store.actions.selectNodeByIndex(
				clamp(selectedIdx + 1, nodeList.length - 1),
			);
		},
		onPrev: () => {
			store.actions.selectNodeByIndex(
				clamp(selectedIdx - 1, nodeList.length - 1),
			);
		},
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
	const collapsed = useObserver(() => store.visiblity.collapsed.$.has(id));
	const node = useObserver(() => store.nodes.$.get(id) || null);
	const selected = useObserver(() => store.selected.$ === id);
	const onToggle = () => {
		store.actions.collapseNode(id, store.visiblity.collapsed.$.has(id));
	};

	if (!node) return null;

	return (
		<div
			class={s.item}
			onClick={() => store.actions.selectNode(id)}
			onMouseEnter={() => store.actions.highlightNode(id)}
			data-selected={selected}
			data-id={id}
			data-depth={node.depth}
			style={`padding-left: calc(var(--indent-depth) * ${node.depth - 1})`}
		>
			<div class={s.itemHeader}>
				{node.children.length > 0 && (
					<button
						class={s.toggle}
						data-collapsed={collapsed}
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
	const selected = useObserver(() => store.selected.$);
	const collapsed = useObserver(() => store.visiblity.collapsed.$);

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
