import { h } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "./TreeView";
import { flatten, PropDataType } from "../parseProps";
import { useState, useCallback } from "preact/hooks";
import { AutoSizeInput } from "./AutoSizeInput";

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

	const parsed = flatten(data, [], 7, []);

	return (
		<div class={s.root}>
			<form
				class={s.form}
				onSubmit={e => {
					e.preventDefault();
				}}
			>
				{parsed.map(item => {
					return (
						<SingleItem
							key={item.path.join(".")}
							type={item.type}
							name={item.name}
							collapseable={item.collapsable}
							editable={(editable && item.editable) || false}
							value={item.value}
							path={item.path}
							onInput={onInput}
							depth={item.depth}
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
	type: PropDataType;
	collapseable?: boolean;
	path: ObjPath;
	name: string;
	value: any;
	onInput?: ChangeFn;
	depth: number;
}

export function SingleItem(props: SingleProps) {
	const {
		onInput,
		path,
		editable = false,
		name,
		type,
		collapseable = false,
		depth,
	} = props;

	const css: Record<string, string> = {
		string: s.string,
		number: s.number,
		function: s.function,
		boolean: s.boolean,
		null: s.null,
		array: s.array,
		object: s.object,
	};

	const v = props.value;
	const update = (v: any) => {
		onInput && onInput(v, path);
	};

	return (
		<div
			key={path.join(".")}
			class={s.row}
			data-depth={depth}
			style={`padding-left: calc(var(--indent-depth) * ${depth})`}
		>
			{collapseable && (
				<button
					class={s.toggle}
					data-collapsed={false}
					onClick={() => console.log(path)}
				>
					<Arrow />
				</button>
			)}
			<div
				class={`${s.name} ${!collapseable ? s.noCollapse : ""}`}
				data-type={type}
			>
				{editable ? (
					<AutoSizeInput
						class={s.nameInput}
						value={name}
						onChange={v => console.log("new value", v)}
					/>
				) : (
					<span class={s.nameStatic}>{name}</span>
				)}
			</div>
			<div class={`${s.property} ${css[type] || ""}`}>
				{editable ? (
					<DataInput value={v} onChange={update} />
				) : (
					<div class={s.mask}>{v + ""}</div>
				)}
			</div>
		</div>
	);
}

export interface InputProps {
	value: string | number | boolean;
	onChange: (value: any) => void;
}

export function DataInput({ value, onChange }: InputProps) {
	let [focus, setFocus] = useState(false);

	let inputType;
	if (typeof value === "boolean") {
		inputType = "checkbox";
	} else {
		inputType = "text";
		if (!focus) value = JSON.stringify(value);
	}

	const onCommit = useCallback((e: Event) => {
		onChange(getEventValue(e));
	}, []);

	const onKeyUp = useCallback((e: KeyboardEvent) => {
		console.log(typeof value, e.key);
		switch (e.key) {
			case "Enter":
			case "Tab":
				(e.currentTarget as any).blur();
				onCommit(e);
				break;
			case "Up":
			case "ArrowUp":
				if (typeof value === "number") {
					onChange(value + 1);
				}
				break;
			case "Down":
			case "ArrowDown":
				if (typeof value === "number") {
					onChange(value - 1);
				}
				break;
		}
	}, []);

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
			onKeyUp={onKeyUp}
		/>
	);
}

export function getEventValue(ev: any) {
	return ev.currentTarget!.checked || ev.currentTarget.value;
}
