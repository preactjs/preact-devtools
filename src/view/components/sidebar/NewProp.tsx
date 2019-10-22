import { h } from "preact";
import { useState } from "preact/hooks";
import { DataInput } from "../DataInput";

export function NewProp() {
	const [value, setValue] = useState(undefined);

	return (
		<div>
			<DataInput value={value} onChange={v => console.log(v)} />
		</div>
	);
}
