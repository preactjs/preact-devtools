import { h } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "./TreeView";
import { flatten, PropDataType } from "../parseProps";
import { useState, useCallback, useRef } from "preact/hooks";
import { AutoSizeInput } from "./AutoSizeInput";
import { Undo } from "./icons";

export type ObjPath = Array<string | number>;
export type ChangeFn = (value: any, path: ObjPath) => void;

export interface Props {
	editable?: boolean;
	data: any;
	onChange?: ChangeFn;
	onRename?: ChangeFn;
}

export function ElementProps(props: Props) {
	const { data, editable, onChange, onRename } = props;

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
							editable={editable}
							value={item.value}
							path={item.path}
							onChange={onChange}
							onRename={onRename}
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
	onChange?: ChangeFn;
	onRename?: ChangeFn;
	depth: number;
}

export function SingleItem(props: SingleProps) {
	const {
		onChange,
		path,
		editable = false,
		name,
		type,
		collapseable = false,
		depth,
		onRename,
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
		onChange && onChange(v, path);
	};
	const rename = (v: string) => {
		if (onRename && path[path.length - 1] !== v) {
			onRename(v, path);
		}
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
					<AutoSizeInput class={s.nameInput} value={name} onChange={rename} />
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
	const hasCheck = typeof value === "boolean";

	const onCommit = useCallback((e: Event) => {
		onChange(getEventValue(e));
	}, []);

	const onKeyUp = useCallback((e: KeyboardEvent) => {
		console.log(typeof value, e.key);
		switch (e.key) {
			case "Enter":
			case "Tab":
				// (e.currentTarget as any).blur();
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

	const [focus, setFocus] = useState(false);
	const [initialValue] = useState(value);
	const [v, set] = useState(value);
	const ref = useRef<HTMLInputElement>();

	return (
		<div class={s.valueWrapper}>
			{hasCheck && !focus && (
				<input
					class={s.check}
					type="checkbox"
					checked={value as any}
					onBlur={onCommit}
				/>
			)}
			<div class={`${s.innerWrapper} ${hasCheck ? s.withCheck : ""}`}>
				<input
					type="text"
					ref={ref}
					class={`${s.nameInput} ${s.valueInput} ${focus ? s.focus : ""}`}
					value={"" + v}
					onFocus={() => setFocus(true)}
					onBlur={() => setFocus(false)}
					onInput={e => set((e.target as any).value)}
				/>
				<button
					class={`${s.undoBtn} ${v !== initialValue ? s.showUndoBtn : ""}`}
					onClick={() => {
						setFocus(true);
						if (ref.current) ref.current.focus();
						set(initialValue);
						onChange(initialValue);
					}}
				>
					<Undo size="s" />
				</button>
			</div>
		</div>
	);
}

export function getEventValue(ev: any) {
	return ev.currentTarget!.checked || ev.currentTarget.value;
}
