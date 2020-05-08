import { h } from "preact";
import { useRef, useCallback } from "preact/hooks";
import s from "./FlameGraph.css";
import { NodeTransform } from "./transform/focusNode";
import { ID } from "../../../store/types";

export interface Props {
	selected: boolean;
	children: any;
	parentId: number;
	commitRootId: number;
	onClick: (id: ID) => void;
	node: NodeTransform;
}

const ROW_HEIGHT = 21; // Account 1px for border
const MIN_TEXT_WIDTH = 32; // Don't show text if smaller than this value

export function FlameNode(props: Props) {
	const { onClick, selected, node } = props;
	const transform = useRef("");
	const widthCss = useRef("");

	const onRawClick = useCallback(() => onClick(node.id), [node.id]);

	const { visible, width, x } = node;

	if (visible) {
		const y = node.row * ROW_HEIGHT;
		widthCss.current = `width: ${Math.max(width, 2)}px;`;
		transform.current = `transform: translate3d(${x}px, ${y}px, 0);`;
	}

	return (
		<div
			class={s.node}
			onClick={onRawClick}
			data-id={node.id}
			data-commit-root={props.commitRootId}
			data-parent-id={props.parentId}
			data-visible={visible}
			data-weight={node.weight}
			data-maximized={node.maximized}
			data-selected={selected}
			data-overflow={width < MIN_TEXT_WIDTH}
			style={`height: ${ROW_HEIGHT}px; ${transform.current} ${widthCss.current}`}
		>
			<span class={s.text} style={widthCss.current}>
				{props.children}
			</span>
		</div>
	);
}
