import { h } from "preact";
import s from "./RadioBar.css";

export interface RadioBarProps {
	value: string;
	name: string;
	items: Array<{ label: string; value: string }>;
	onChange(v: string): void;
}

export function RadioBar(props: RadioBarProps) {
	return (
		<div class={s.root}>
			{props.items.map(x => {
				return (
					<label key={x.value}>
						<input
							name={props.name}
							class={s.input}
							checked={props.value === x.value}
							type="radio"
							value={x.value}
							onInput={() => props.onChange(x.value)}
						/>
						<span class={s.label}>{x.label}</span>
					</label>
				);
			})}
		</div>
	);
}
