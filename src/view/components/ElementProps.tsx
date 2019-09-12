import { h } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "./TreeView";
import { flatten, PropDataType } from "../parseProps";
import { useState, useCallback, useRef, useMemo } from "preact/hooks";
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

	const parsed = useMemo(() => flatten(data, [], 7, []), [data]);
	// const state = useMemo(() => {
	// 	const vis = new Map<string, string[]>();

	// 	parsed.forEach(v => {
	// 		const key = v.path.join(".");
	// 		let idx = -1;
	// 		let tmp = key;
	// 		while ((idx = tmp.lastIndexOf(".")) > -1) {
	// 			tmp = tmp.slice(0, idx);
	// 			console.log(tmp);
	// 			if (vis.has(tmp)) {
	// 				vis.get(tmp)!.push(key);
	// 			}
	// 		}

	// 		vis.set(key, []);
	// 	});
	// }, [parsed]);
	const [collapsed, setCollapsed] = useState(new Set<string>());
	const [hidden, sethidden] = useState(new Set<string>());

	const hide = useCallback(
		(raw: ObjPath) => {
			const path = raw.join(".");
			const shouldHide = !collapsed.has(path);

			if (shouldHide) collapsed.add(path);
			else collapsed.delete(path);

			parsed.forEach(x => {
				const child = x.path.join(".");
				if (child !== path && child.startsWith(path)) {
					if (shouldHide) hidden.add(child);
					else hidden.delete(child);
				}
			});

			setCollapsed(new Set(collapsed));
			sethidden(new Set(hidden));
		},
		[parsed],
	);

	return (
		<div class={s.root}>
			<form
				class={s.form}
				onSubmit={e => {
					e.preventDefault();
				}}
			>
				{parsed.map(item => {
					const key = item.path.join(".");
					if (hidden.has(key)) return null;

					return (
						<SingleItem
							key={key}
							type={item.type}
							name={item.name}
							collapseable={item.collapsable}
							collapsed={collapsed.has(key)}
							onCollapse={hide}
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
	collapsed?: boolean;
	path: ObjPath;
	name: string;
	value: any;
	onChange?: ChangeFn;
	onRename?: ChangeFn;
	onCollapse?: (path: ObjPath) => void;
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
		collapsed = false,
		depth,
		onRename,
		onCollapse,
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
					data-collapsed={collapsed}
					onClick={() => onCollapse && onCollapse(path)}
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
