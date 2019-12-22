import { h, options, Fragment, render } from "../vendor/preact-10";
import { DevtoolsHook } from "../../adapter/hook";
import { TodoList } from "./TodoList";
import { DeepTree } from "./DeepTree";
import { LegacyContext } from "./legacyContext";
import { Stateful } from "./state";
import { createRenderer } from "../../adapter/10/renderer";
import { setupOptions } from "../../adapter/10/options";
import { Booleans, Complex } from "./DataTypes";
import { FullWidthHighlighter } from "./Highlighting";
import { Gradient } from "./Gradient";
import s from "../../view/components/Devtools.css";

export function initPreact10(hook: DevtoolsHook) {
	if (hook.attachPreact) {
		return hook.attachPreact("10.0.5", options, {
			Fragment,
		});
	} else {
		console.warn(
			"Devtools hook is missing attachPreact() method. Please update the 'preact-devtools' extension.",
		);

		const renderer = createRenderer(hook, { Fragment: Fragment as any });
		setupOptions(options, renderer);
		hook.attach(renderer);
	}
}

export function renderExamples10(node: HTMLElement) {
	render(
		<div class={s.theme}>
			{/* <FullWidthHighlighter /> */}
			<div style="padding: 2rem">
				<p>Highlight full width</p>
				<small>
					Uncomment all other components so that the vertical scrollbar is gone
				</small>
				<p>Todo list</p>
				<TodoList />
				<p>Legacy context</p>
				<LegacyContext />
				<p>Class state</p>
				<Stateful />
				<p>Data Types</p>
				<Booleans value={true} />
				<Complex />
				<p>Profiler Gradient</p>
				<Gradient />
				<p>Deep tree</p>
				<DeepTree />
				<br />
			</div>
		</div>,
		node,
	);
}
