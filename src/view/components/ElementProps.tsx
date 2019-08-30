import { h } from "preact";
import s from "./ElementProps.css";

export interface Props {
	editable?: boolean;
	data: any;
	onInput?: (value: any) => void;
}

export function ElementProps(props: Props) {
	const { data, editable } = props;

	return (
		<div class={s.root}>
			<form
				class={s.form}
				onSubmit={e => {
					e.preventDefault();
				}}
			>
				{Object.keys(data).map(key => {
					const v = data[key];
					const path = ["abc"];
					let el = null;
					switch (typeof v) {
						case "string":
							el = editable ? (
								<DataInput value={v} onInput={props.onInput} />
							) : (
								<div class={s.string}>
									<div class={s.inputWrapper}>
										<div class={s.mask}>{v}</div>
									</div>
								</div>
							);
							break;
						case "number":
							el = editable ? (
								<DataInput value={v} onInput={props.onInput} />
							) : (
								<div class={s.number}>
									<div class={s.inputWrapper}>
										<div class={s.mask}>{v}</div>
									</div>
								</div>
							);
							break;
						case "object":
							if (v === null) {
								el = (
									<div class={s.null}>
										<div class={s.inputWrapper}>
											<div class={s.mask}>null</div>
										</div>
									</div>
								);
							} else if (Array.isArray(v)) {
								el = "ARRAY";
							} else if (
								v.name !== undefined &&
								v.type === "function" &&
								Object.keys(v).length === 2
							) {
								el = (
									<div class={s.function}>
										<div class={s.inputWrapper}>
											<div class={s.mask}>{v.name}()</div>
										</div>
									</div>
								);
							}
							break;
					}

					return (
						<div key={path.join(".")} class={s.row}>
							<div class={s.name}>{key}</div>
							<div class={s.property}>{el}</div>
						</div>
					);
				})}
				<input type="submit" style="position: absolute; left: -9999px" />
			</form>
		</div>
	);
}

export interface InputProps {
	value: string | number | boolean;
	onInput?: (value: any) => void;
}

export function DataInput({ value, onInput }: InputProps) {
	let typeCss = "";
	let inputType = "text";
	if (typeof value === "string") {
		typeCss = s.string;
		inputType = "text";
	} else if (typeof value === "number") {
		typeCss = s.number;
		inputType = "number";
	} else {
		typeCss = s.boolean;
		inputType = "checkbox";
	}

	return (
		<div class={`${s.inputWrapper} ${typeCss}`}>
			{inputType === "checkbox" ? (
				<input
					class={s.input}
					type="checkbox"
					checked={value as any}
					onInput={e => onInput && onInput((e.currentTarget! as any).value)}
				/>
			) : (
				<input
					class={s.input}
					type="text"
					value={value as any}
					onInput={e => onInput && onInput((e.currentTarget! as any).checked)}
				/>
			)}
			<span class={s.mask}>{value}</span>
		</div>
	);
}
