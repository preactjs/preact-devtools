import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

export interface Props {
	onClick: () => void;
	children: any;
	class?: string;
	style?: string | Record<string, any>;
}

export function OutsideClick(props: Props) {
	let ref = useRef<HTMLDivElement>();

	useEffect(() => {
		let listener = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as any)) {
				props.onClick();
			}
		};
		window.addEventListener("click", listener);
		return () => window.removeEventListener("click", listener);
	}, [props.children]);

	return (
		<div ref={ref} class={props.class} style={props.style}>
			{props.children}
		</div>
	);
}
