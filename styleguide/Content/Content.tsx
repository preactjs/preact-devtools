import { h } from "preact";
import s from "./Content.css";
import { ProfilerDemo } from "../stories/Profiler.story";

export const stories: Record<string, any> = {
	profiler: ProfilerDemo,
};

export function Content() {
	const params = window.location;
	const name = params.hash.slice(1);
	const Component = stories[name];
	console.log(params, Component);
	return (
		<div class={s.root}>
			<Component />
		</div>
	);
}
