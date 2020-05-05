import { h } from "preact";
import { useState, useRef, useEffect, useMemo } from "preact/hooks";
import s from "./FlameGraph.css";
import { NodeTransform } from "./transform/focusNode";

export interface Props {
	weight: number | null;
	maximized: boolean;
	selected: boolean;
	children: any;
	canvasWidth: number;
	onClick: () => void;
	node: NodeTransform;
	scale: number;
}

const ROW_HEIGHT = 21; // Account 1px for border
const MIN_TEXT_WIDTH = 32; // Don't show text if smaller than this value

export function FlameNode(props: Props) {
	const {
		onClick,
		weight,
		maximized,
		selected,
		canvasWidth,
		node,
		scale,
	} = props;
	const transform = useRef("");
	const widthCss = useRef("");
	const [hidden, setHidden] = useState(false);

	const x = node.x * scale;
	const y = node.row * ROW_HEIGHT;
	const width = node.width * scale;

	const visible = useMemo(() => {
		return (
			maximized ||
			(x >= 0 && x <= canvasWidth) ||
			(x + width >= 0 && x + width <= canvasWidth)
		);
	}, [maximized, x, canvasWidth, width]);

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
		widthCss.current = `width: ${Math.max(2, width)}px;`;
		transform.current = `transform: translate3d(${x}px, ${y}px, 0);`;
	}

	return (
		<div
			class={s.node}
			onClick={onClick}
			data-visible={!hidden && visible}
			data-weight={weight}
			data-maximized={maximized}
			data-selected={selected}
			data-overflow={width < MIN_TEXT_WIDTH}
			style={`height: ${ROW_HEIGHT}px; ${transform.current} ${widthCss.current}`}
		>
			<span class={s.text}>{props.children}</span>
		</div>
	);
}
