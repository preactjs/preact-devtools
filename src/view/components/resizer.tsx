import { h, ComponentChildren, toChildArray } from "preact";
import { useEffect, useState } from "preact/hooks";
import s from "./resizer.css";

export interface Props {
	direction?: "h" | "v";
	children: ComponentChildren;
}

export function Resizer(props: Props) {
	const dir = props.direction || "h";
	const children = toChildArray(props.children);

	const [sizes, setSizes] = useState(children.map(() => 100 / children.length));

	return (
		<div
			class={s.container}
			data-direction={dir === "h" ? "horizontal" : "vertical"}
		>
			{children.map((child, i) => {
				return (
					<div class={s.item} key={i}>
						{child}
					</div>
				);
			})}
			{children.map(() => (
				<div class={s.drag}></div>
			))}
		</div>
	);
}
