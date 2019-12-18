import { h } from "preact";

export function Booleans(props: { value: boolean }) {
	return <p>Boolean: {props.value + ""}</p>;
}
