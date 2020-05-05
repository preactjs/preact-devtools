import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import s from "./FlameGraph.css";
import { NodeTransform } from "./transform/focusNode";

export interface Props {
	selected: boolean;
	children: any;
	onClick: () => void;
	node: NodeTransform;
}

const ROW_HEIGHT = 21; // Account 1px for border
const MIN_TEXT_WIDTH = 32; // Don't show text if smaller than this value

export function FlameNode(props: Props) {
	const { onClick, selected, node } = props;
	const transform = useRef("");
	const widthCss = useRef("");
	const [hidden, setHidden] = useState(false);

	const { visible, width, x } = node;

	useEffect(() => {
		let timeout = -1;
		if (!hidden && !visible) {
			timeout = setTimeout(() => setHidden(true));
		} else if (hidden) {
			setHidden(false);
		}
		return () => clearTimeout(timeout);
	}, [visible]);

	if (hidden) {
		// return null;
	}

	if (visible) {
		const y = node.row * ROW_HEIGHT;
		widthCss.current = `width: ${Math.max(2, width)}px;`;
		transform.current = `transform: translate3d(${x}px, ${y}px, 0);`;
	}

	return (
		<div
			class={s.node}
			onClick={onClick}
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
