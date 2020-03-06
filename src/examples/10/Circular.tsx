import { h } from "../vendor/preact-10";

const props: any = { foo: 123, bar: 123 };
props.foo = props;

function CircularInner() {
	return <h1>Circular</h1>;
}

export function Circular() {
	return <CircularInner {...props} />;
}
