import { h } from "preact";
import s from "./ElementProps.css";
// import { useState } from "preact/hooks";

export type ObjPath = Array<string | number>;
export type ChangeFn = (value: any, path: ObjPath) => void;

export interface Props {
	editable?: boolean;
	data: any;
	path: ObjPath;
	onInput?: ChangeFn;
}

export function ElementProps(props: Props) {
	const { data, editable, path = [], onInput } = props;

	return (
		<div class={s.root}>
			<form
				class={s.form}
				onSubmit={e => {
					e.preventDefault();
				}}
			>
				{Object.keys(data).map(key => {
					return (
						<SingleItem
							key={path.join(".") + key}
							name={key}
							editable={editable || false}
							value={data[key]}
							path={path.concat(key)}
							onInput={onInput}
						/>
					);
				})}
			</form>
		</div>
	);
}

export interface SingleProps {
	key?: string;
	editable?: boolean;
	path: ObjPath;
	name: string;
	value: any;
	onInput?: ChangeFn;
	depthLimit?: number;
}

export function SingleItem(props: SingleProps) {
	const {
		onInput,
		path,
		editable = false,
		name,
		depthLimit = Infinity,
	} = props;
	if (depthLimit === 0) return <div>...</div>;

	const v = props.value;
	let el = null;
	const update = (v: any) => {
		onInput && onInput(v, path);
	};
	let typeCss = "";

	if (v !== null && typeof v === "object") {
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
			typeCss = s.function;
			el = `${v.name}()`;
		}
	} else {
		typeCss =
			typeof v === "boolean"
				? s.boolean
				: typeof v === "string"
				? s.string
				: typeof v === "number"
				? s.number
				: s.null;

		el = editable ? (
			<DataInput value={v} onChange={update} />
		) : (
			<div class={s.mask}>{v + ""}</div>
		);
	}

	return (
		<div key={path.join(".")} class={s.row}>
			<div class={s.name}>{name}</div>
			<div class={`${s.property} ${typeCss}`}>{el}</div>
		</div>
	);
}

export interface InputProps {
	value: string | number | boolean;
	onChange: (value: any) => void;
}

export function DataInput({ value, onChange }: InputProps) {
	// let [focus, setFocus] = useState(false);
	const setFocus = (v: boolean) => null;

	let inputType = "text";
	if (typeof value === "string") {
		inputType = "text";
		// if (!focus) value = `"${value}"`;
	} else if (typeof value === "number") {
		inputType = "number";
	} else {
		inputType = "checkbox";
	}

	const onCommit = (e: Event) => {
		onChange(getEventValue(e));
	};

	return inputType === "checkbox" ? (
		<input
			class={s.input}
			type="checkbox"
			checked={value as any}
			onBlur={onCommit}
		/>
	) : (
		<input
			class={s.input}
			type={inputType}
			onFocus={() => setFocus(true)}
			onBlur={() => setFocus(false)}
			value={value as any}
			onKeyUp={e => {
				if (e.keyCode === 13) {
					(e.currentTarget as any).blur();
					onCommit(e);
				}
			}}
		/>
	);
}

export function getEventValue(ev: any) {
	return ev.currentTarget!.checked || ev.currentTarget.value;
}
