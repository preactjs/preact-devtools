import { h } from "preact";
import s from "./ElementProps.css";

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
							editable={editable}
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
	const { onInput, path, editable, name, depthLimit = Infinity } = props;
	if (depthLimit === 0) return <div>...</div>;

	const v = props.value;
	let el = null;
	const update = (v: any) => {
		onInput && onInput(v, path);
	};

	switch (typeof v) {
		case "boolean":
			return <DataInput value={v} onChange={update} />;
		case "string":
			el = editable ? (
				<DataInput value={v} onChange={update} />
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
				<DataInput value={v} onChange={update} />
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
			<div class={s.name}>{name}</div>
			<div class={s.property}>{el}</div>
		</div>
	);
}

export interface InputProps {
	value: string | number | boolean;
	onChange: (value: any) => void;
}

export function DataInput({ value, onChange }: InputProps) {
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

	const onCommit = (e: Event) => {
		onChange(getEventValue(e));
	};

	return (
		<div class={`${s.inputWrapper} ${typeCss}`}>
			{inputType === "checkbox" ? (
				<input
					class={s.input}
					type="checkbox"
					checked={value as any}
					onBlur={onCommit}
				/>
			) : (
				<input
					class={s.input}
					type="text"
					value={value as any}
					onKeyUp={e => {
						console.log(e.keyCode);
						if (e.keyCode === 13) {
							(e.currentTarget as any).blur();
							onCommit(e);
						}
					}}
				/>
			)}
			<span class={s.mask}>{value}</span>
		</div>
	);
}

export function getEventValue(ev: any) {
	return ev.currentTarget!.checked || ev.currentTarget.value;
}
