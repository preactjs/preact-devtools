// @ts-ignore
import { options, Fragment, render } from "../vendor/preact-10";
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
import { Circular } from "./Circular";
import s from "../../view/components/Devtools.css";
import { Prime } from "./Prime";
import { html } from "../vendor/htm";

export function initPreact10(hook: DevtoolsHook) {
	if (hook.attachPreact) {
		return hook.attachPreact("10.0.5", options, {
			Fragment,
		});
	} else {
		console.warn(
			"Devtools hook is missing attachPreact() method. Please update the 'preact-devtools' extension.",
		);
	}
}

export function renderExamples10(node: HTMLElement) {
	render(
		html`
			<div class=${s.theme}>
				<div style="padding: 2rem">
					<p>Highlight full width</p>
					<small>
						Uncomment all other components so that the vertical scrollbar is
						gone
					</small>
					<p>Primes</p>
					<${Prime} max=${10000} />
					<p>Todo list</p>
					<TodoList />
					<${LegacyContext} />
					<p>Class state</p>
					<${Stateful} />
					<p>Data Types</p>
					<${Booleans} value=${true} />
					<${Complex} />
					<p>Profiler Gradient</p>
					<${Gradient} />
					<p>Deep tree</p>
					<${DeepTree} /> */}
					<${Circular} />
					<br />
				</div>
			</div>
		`,
		node,
	);
}
