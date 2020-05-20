import { h } from "preact";
import { useRef } from "preact/hooks";
import { useResize } from "../utils";
import s from "./CanvasHighlight.css";

export function CanvasHighlight() {
	const ref = useRef<HTMLCanvasElement>();

	useResize(
		() => {
			if (ref.current) {
				ref.current.width = window.innerWidth;
				ref.current.height = window.innerHeight;
			}
		},
		[],
		true,
	);

	return <canvas class={s.root} ref={ref} />;
}
