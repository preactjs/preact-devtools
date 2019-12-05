import { h, options, Fragment, render } from "../vendor/preact-10";
import { DevtoolsHook } from "../../adapter/hook";
import { TodoList } from "./TodoList";
import { DeepTree } from "./DeepTree";
import { LegacyContext } from "./legacyContext";
import { Stateful } from "./state";

export function initPreact10(hook: DevtoolsHook) {
	return hook.attach("10.0.5", options, {
		Fragment,
	});
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
			<p>Deep tree</p>
			<DeepTree />
			<br />
		</div>,
		node,
	);
}
