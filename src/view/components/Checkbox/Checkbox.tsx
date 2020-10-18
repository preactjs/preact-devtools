import { h } from "preact";
import { CheckboxChecked, CheckboxUnChecked } from "../icons";
import s from "./Checkbox.module.css";

export interface CheckboxProps {
	testId?: string;
	checked: boolean;
	onChange: (v: boolean) => void;
	children: any;
}

export function Checkbox(props: CheckboxProps) {
	return (
		<label class={s.root}>
			<span class={s.checkbox}>
				<input
					type="checkbox"
					checked={props.checked}
					data-testid={props.testId}
					onInput={e => props.onChange((e.target as any).checked)}
				/>
				{props.checked ? <CheckboxChecked /> : <CheckboxUnChecked />}
			</span>
			<span class={s.content}>{props.children}</span>
		</label>
	);
}
