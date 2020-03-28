import { html } from "../vendor/htm";

const props: any = { foo: 123, bar: 123 };
props.foo = props;

function CircularInner() {
	return html`
		<h1>Circular</h1>
	`;
}

export function Circular() {
	return html`
		<${CircularInner} ...${props} />
	`;
}
