// @ts-ignore
import { Component } from "../vendor/preact-10";
import { html } from "../vendor/htm";

class Child extends Component {
	render() {
		return html`
			<div>Context value: ${(this as any).context.foo}</div>
		`;
	}
}

class Parent extends Component {
	getChildContext() {
		return { foo: "bar" };
	}

	render() {
		return html`
			<${Child} />
		`;
	}
}

export function LegacyContext() {
	return html`
		<${Parent} />
	`;
}
