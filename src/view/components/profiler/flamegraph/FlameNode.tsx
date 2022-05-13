import { h } from "preact";
import { useRef } from "preact/hooks";
import s from "./FlameGraph.module.css";
import { ID } from "../../../store/types";
import { Position } from "../data/flames";

export interface Props {
	selected: boolean;
	children: any;
	weight: number;
	commitRootId: number;
	visible: boolean;
	maximized: boolean;
	commitParent: boolean;

	pos: Position;

	onClick: (id: ID) => void;
	onMouseEnter: (id: ID) => void;
	onMouseLeave: () => void;
}

const ROW_HEIGHT = 21; // Account 1px for border
const MIN_TEXT_WIDTH = 32; // Don't show text if smaller than this value

export function FlameNode({
	onClick,
	selected,
	onMouseEnter,
	onMouseLeave,
	maximized,
	visible,
	commitParent,
	weight,
	children,
	pos,
}: Props) {
	const transform = useRef("");
	const widthCss = useRef("");

	if (visible) {
		const y = pos.row * ROW_HEIGHT;
		widthCss.current = `width: ${Math.max(pos.width, 2)}px;`;
		transform.current = `transform: translate3d(${pos.start}px, ${y}px, 0);`;
	}

	return (
		<div
			class={s.node}
			onClick={() => onClick(pos.id)}
			onMouseEnter={() => onMouseEnter(pos.id)}
			onMouseLeave={onMouseLeave}
			data-id={pos.id}
			data-visible={visible}
			data-weight={weight}
			data-commit-parent={commitParent}
			data-maximized={maximized}
			data-selected={selected}
			data-overflow={pos.width < MIN_TEXT_WIDTH}
			style={`height: ${ROW_HEIGHT}px; ${transform.current} ${widthCss.current}`}
		>
			<span class={s.text} style={widthCss.current}>
				{children}
			</span>
		</div>
	);
}
