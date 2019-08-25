import { h } from "preact";
import s from "./Tree.css";
import { ID, useStore, getAllChildren } from "../store";

export interface TreeProps {
	rootId: number;
}
export function TreeView(props: TreeProps) {
	const nodes = useStore(store => {
		console.log("rot", props.rootId, store.nodes(), store.rootToChild());
		return getAllChildren(
			store.nodes(),
			store.rootToChild().get(props.rootId)!,
		);
	});
	return (
		<div class={s.tree}>
			{nodes.map(id => (
				<TreeItem key={id} id={id} />
			))}
			<HighlightPane />
			<p>
				root id: {props.rootId}, nodes: {nodes.length}
			</p>
		</div>
	);
}

export function TreeItem(props: { key: any; id: ID }) {
	const { id } = props;
	const {
		dim,
		selected,
		onSelect,
		collapsed,
		onToggle,
		node,
		hidden,
	} = useStore(store => {
		return {
			dim: store.selection.children().includes(id),
			selected: store.selection.id() === id,
			onSelect: store.actions.selectNode,
			collapsed: store.visiblity.collapsed().has(id),
			hidden: store.visiblity.hidden().has(id),
			onToggle: store.actions.collapseNode,
			node: store.nodes().get(id),
		};
	});

	if (!node || hidden) return null;

	return (
		<div
			class={`${s.item} ${dim ? s.dim : ""}`}
			onClick={() => onSelect(id)}
			data-selected={selected}
			data-depth={node.depth}
		>
			<div class={`${s.itemHeader}`}>
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
	const id = useStore(store => store.selection.last());
	console.log("last", id);
	return <div>Last {id + ""}</div>;
}
