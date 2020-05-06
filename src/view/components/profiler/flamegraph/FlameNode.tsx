import { h } from "preact";
import { useRef } from "preact/hooks";
import s from "./FlameGraph.css";
import { NodeTransform } from "./transform/focusNode";

export interface Props {
	selected: boolean;
	children: any;
	parentId: number;
	commitRootId: number;
	onClick: () => void;
	node: NodeTransform;
}

const ROW_HEIGHT = 21; // Account 1px for border
const MIN_TEXT_WIDTH = 32; // Don't show text if smaller than this value

export function FlameNode(props: Props) {
	const { onClick, selected, node } = props;
	const transform = useRef("");
	const widthCss = useRef("");

	const { visible, width, x } = node;

	if (visible) {
		const y = node.row * ROW_HEIGHT;
		widthCss.current = `width: ${width}px;`;
		transform.current = `transform: translate3d(${x}px, ${y}px, 0);`;
	}

	return (
		<div
			class={s.node}
			onClick={onClick}
			data-id={node.id}
			data-commit-root={props.commitRootId}
			data-parent-id={props.parentId}
			data-visible={visible}
			data-weight={node.weight}
			data-maximized={node.maximized}
			data-selected={selected}
			data-overflow={width < MIN_TEXT_WIDTH}
			style={`height: ${ROW_HEIGHT}px; ${transform.current} ${widthCss.current};`}
		>
			<span class={s.text}>{props.children}</span>
		</div>
	);
}
