import { h } from "preact";
import { useState } from "preact/hooks";
import { DataInput } from "../DataInput";
import s from "./NewProp.css";
import s2 from "./ElementProps.css";

export function NewProp() {
	const [value, setValue] = useState(undefined);

	return (
		<div class={s.root}>
			<div class={s2.name}>
				<input type="text" class={`${s2.nameInput} ${s.name}`} />
			</div>
			<DataInput class={s.value} value={value} onChange={v => console.log(v)} />
		</div>
	);
}
