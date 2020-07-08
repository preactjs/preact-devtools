import { h } from "preact";
import s from "./Content.css";
import { ProfilerDemo } from "../stories/profiler-1.story";
import { ProfilerDemo2 } from "../stories/profiler-2.story";
import { ProfilerDemo3 } from "../stories/profiler-3.story";
import { ProfilerDemo4 } from "../stories/profiler-4.story";
import { ProfilerDemo5 } from "../stories/profiler-5";
import { LoadingDemo } from "../stories/loading.story";
import { StatsDemo } from "../stories/stats.story";

export const stories: Record<string, any> = {
	loading: LoadingDemo,
	profiler1: ProfilerDemo,
	profiler2: ProfilerDemo2,
	profiler3: ProfilerDemo3,
	profiler4: ProfilerDemo4,
	profiler5: ProfilerDemo5,
	stats: StatsDemo,
};

export function Content() {
	const params = window.location;
	const name = params.hash.slice(1);
	const Component = stories[name];
	return (
		<div class={s.root}>
			{Component ? <Component /> : <p>Could not load: "{String(Component)}"</p>}
		</div>
	);
}
