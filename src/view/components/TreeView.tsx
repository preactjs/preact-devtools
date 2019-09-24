import { h } from "preact";
import s from "./Tree.css";
import { ID, useObserver, getAllChildren, useStore } from "../store";
import { useEffect, useState, useCallback, useRef } from "preact/hooks";
import { getLastDomChild } from "./utils";

export function TreeView() {
	const store = useStore();
	const nodes = useObserver(() => store.nodeList.$);

	const onKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const selected = store.selected.$;
			const idx = selected ? nodes.findIndex(x => x === selected.id) : 0;
			let next = idx;
			console.log(e);
			switch (e.key) {
				case "ArrowRight":
					if (
						store.selected.$ &&
						store.visiblity.hidden.$.has(store.selected.$.id)
					) {
						store.actions.collapseNode(store.selected.$.id);
						break;
					}
				case "ArrowDown":
					e.preventDefault();
					next = Math.max(0, Math.min(idx + 1, nodes.length - 1));
					store.actions.selectNode(nodes[next]);
					break;
			}
		},
		[nodes],
	);

	return (
		<div
			tabIndex={0}
			class={s.tree}
			onKeyDown={onKeyDown}
			onMouseLeave={() => store.actions.highlightNode(null)}
		>
			{nodes.map(id => (
				<TreeItem key={id} id={id} />
			))}
			<HighlightPane />
		</div>
	);
}

export function TreeItem(props: { key: any; id: ID }) {
	const { id } = props;
	const store = useStore();
	const {
		onSelect,
		collapsed,
		onToggle,
		node,
		hidden,
		selected,
		onHover,
	} = useObserver(() => {
		const node = store.nodes.$.get(id);
		return {
			selected: node ? node.selected.$ : false,
			onSelect: store.actions.selectNode,
			collapsed: store.visiblity.collapsed.$.has(id),
			hidden: store.visiblity.hidden.$.has(id),
			onToggle: store.actions.collapseNode,
			onHover: store.actions.highlightNode,
			node,
		};
	});

	const ref = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (ref.current) {
			store.selectedRef.$ = ref.current;
		}
	}, [ref.current, selected]);

	if (!node || hidden) return null;

	return (
		<div
			ref={ref}
			class={s.item}
			onClick={() => onSelect(id)}
			onMouseEnter={() => onHover(id)}
			data-selected={selected}
			data-depth={node.depth}
			style={`padding-left: calc(var(--indent-depth) * ${node.depth})`}
		>
			<div class={s.itemHeader}>
				{node.children.length > 0 && (
					<button
						class={s.toggle}
						data-collapsed={collapsed}
						onClick={() => onToggle(id)}
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

export function HighlightPane() {
	const store = useStore();
	const ref = useObserver(() => store.selectedRef.$);
	const selected = useObserver(() => store.selected.$);
	const collapsed = useObserver(() => store.visiblity.collapsed.$);

	let [pos, setPos] = useState({ top: 0, height: 0 });
	useEffect(() => {
		if (ref && selected && !collapsed.has(selected.id)) {
			const last = getLastDomChild(ref);

			const rect = ref.getBoundingClientRect();
			const top = ref.offsetTop + rect.height;
			let height = 0;
			if (last) {
				const lastRect = last.getBoundingClientRect();
				height = last.offsetTop + lastRect.height - top;
			}
			setPos({ top, height });
		} else {
			setPos({ top: 0, height: 0 });
		}
	}, [ref, selected && selected.id, collapsed.size]);

	return (
		<div
			class={s.dimmer}
			style={`top: ${pos.top}px; height: ${pos.height}px;`}
		/>
	);
}
