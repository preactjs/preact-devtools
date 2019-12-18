import { h, options, Fragment, render } from "../vendor/preact-10";
import { DevtoolsHook } from "../../adapter/hook";
import { TodoList } from "./TodoList";
import { DeepTree } from "./DeepTree";
import { LegacyContext } from "./legacyContext";
import { Stateful } from "./state";
import { createRenderer } from "../../adapter/10/renderer";
import { setupOptions } from "../../adapter/10/options";
import { Booleans } from "./DataTypes";

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
		<div>
			<p>Todo list</p>
			<TodoList />
			<p>Legacy context</p>
			<LegacyContext />
			<p>Class state</p>
			<Stateful />
			<p>Data Types</p>
			<Booleans value={true} />
			<p>Deep tree</p>
			<DeepTree />
			<br />
		</div>,
		node,
	);
}
