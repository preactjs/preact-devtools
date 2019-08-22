import { h } from "preact";
import { useState, useCallback } from "preact/hooks";
import s from "./Tree.css";
import { DevNode, getAllChildren, ID } from "../store";

export interface TreeProps {
	nodes: DevNode[];
}
export function TreeView(props: TreeProps) {
	const [selected, setSelected] = useState(0);
	const [hideParents, setHideParents] = useState(new Set<ID>());
	const tree = new Map(props.nodes.map(x => [x.id, x]));
	const selectedChildren = getAllChildren(tree, selected);

	const hidden = new Set<ID>();
	hideParents.forEach(parent => {
		getAllChildren(tree, parent).forEach(child => hidden.add(child));
	});

	return (
		<div class={s.tree}>
			{props.nodes.map(node =>
				!hidden.has(node.id) ? (
					<TreeItem
						key={node.id}
						{...node}
						hasChildren={getAllChildren(tree, node.id).size > 0}
						selected={selected === node.id}
						dim={selectedChildren.has(node.id)}
						onClick={() => setSelected(node.id)}
						hideChildren={hideParents.has(node.id)}
						onToggle={id => {
							if (hideParents.has(id)) {
								hideParents.delete(id);
							} else {
								hideParents.add(id);
							}
							setHideParents(new Set(hideParents));
						}}
					/>
				) : null,
			)}
		</div>
	);
}

export function TreeItem(
	props: DevNode & {
		key: any;
		hasChildren: boolean;
		hideChildren: boolean;
		collapsed?: boolean;
		onToggle: (id: number) => void;
		hidden?: boolean;
		selected: boolean;
		dim: boolean;
		onClick: (id: number) => void;
	},
) {
	const {
		id,
		onToggle,
		hidden,
		depth,
		hasChildren,
		hideChildren,
		dim,
		name,
		selected,
		onClick,
	} = props;
	return hidden ? null : (
		<div
			class={`${s.item} ${dim ? s.dim : ""}`}
			onClick={() => onClick(id)}
			data-selected={selected}
			data-depth={depth}
		>
			<div class={`${s.itemHeader}`}>
				{hasChildren && (
					<button
						class={s.toggle}
						data-collapsed={hideChildren}
						onClick={() => onToggle(id)}
					>
						<Arrow />
					</button>
				)}
				{!hasChildren && <div class={s.noToggle} />}
				<span class={s.name}>{name}</span>
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
