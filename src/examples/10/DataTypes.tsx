import { h } from "../vendor/preact-10";
import { useState } from "../vendor/preact-10/hooks";

export function Booleans(props: { value: boolean }) {
	return <p>Boolean: {props.value + ""}</p>;
}

const Dummy = (props: Record<string, any>) => <div>Dummy {props.count}</div>;

export function Complex() {
	const [i, set] = useState(0);
	return (
		<div>
			<button onClick={() => set(i + 1)}>Update Dummy</button>
			<p>Dummy render count {i}</p>
			<Dummy
				count={i}
				data={{
					foo: true,
					bar: false,
					baz: i,
					boof: "foobar",
					foobar: [1, 2, 3],
					fooz: [{ foo: "bar" }, 2],
					booz: {
						bar: [1, 2],
						foo: null,
					},
				}}
			/>
		</div>
	);
}
