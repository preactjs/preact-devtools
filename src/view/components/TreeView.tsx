import { h } from "preact";
import s from "./Tree.css";
import { ID, useObserver, getAllChildren, useStore } from "../store";
import { useEffect, useState } from "preact/hooks";
import { getLastDomChild } from "./utils";

export interface TreeProps {
	rootId: number;
}
export function TreeView(props: TreeProps) {
	const store = useStore();
	const nodes = useObserver(() => {
		return getAllChildren(
			store.nodes(),
			store.rootToChild().get(props.rootId)!,
		);
	}, [store.nodes, store.rootToChild]);

	return (
		<div class={s.tree}>
			<div>
				{nodes.map(id => (
					<TreeItem key={id} id={id} />
				))}
			</div>
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
	} = useObserver(() => {
		const node = store.nodes().get(id);
		return {
			selected: node ? node.selected() : false,
			onSelect: store.actions.selectNode,
			collapsed: store.visiblity.collapsed().has(id),
			hidden: store.visiblity.hidden().has(id),
			onToggle: store.actions.collapseNode,
			node,
		};
	}, [
		store.nodes,
		store.nodes().get(id)!.selected,
		store.visiblity.collapsed,
		store.visiblity.hidden,
	]);

	if (!node || hidden) return null;

	return (
		<div
			class={s.item}
			onClick={ev => onSelect(id, ev.currentTarget as any)}
			data-selected={selected}
			data-depth={node.depth}
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
	const ref = useObserver(() => store.selectedRef(), [store.selectedRef]);

	let [pos, setPos] = useState({ top: 0, height: 0 });
	useEffect(() => {
		if (ref) {
			const last = getLastDomChild(ref);

			const rect = ref.getBoundingClientRect();
			const top = ref.offsetTop + rect.height;
			let height = 0;
			if (last) {
				const lastRect = last.getBoundingClientRect();
				height = last.offsetTop + lastRect.height - top;
			}
			setPos({ top, height });
		}
	}, [ref]);

	return (
		<div
			class={s.dimmer}
			style={`top: ${pos.top}px; height: ${pos.height}px;`}
		/>
	);
}
