import { h } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "./TreeView";
import { flatten, PropDataType } from "../parseProps";
import { useState, useCallback, useMemo } from "preact/hooks";
import { AutoSizeInput } from "./AutoSizeInput";
import { DataInput } from "./DataInput";

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

	const parsed = useMemo(
		() =>
			flatten(data, [], 7, []).sort((a, b) =>
				a.path.join(".").localeCompare(b.path.join(".")),
			),
		[data],
	);

	// Items should be collapsed on init
	const [collapsed, setCollapsed] = useState(
		new Set<string>(
			parsed.filter(x => x.collapsable).map(x => x.path.join(".")),
		),
	);
	const [hidden, sethidden] = useState(
		new Set<string>(
			Array.from(collapsed).reduce<string[]>((acc, key) => {
				parsed.forEach(x => {
					const child = x.path.join(".");
					if (child !== key && child.startsWith(key)) {
						acc.push(child);
					}
				});
				return acc;
			}, []),
		),
	);

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
					type="button"
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
			<div class={s.property}>
				{editable ? (
					<DataInput value={v} onChange={update} />
				) : (
					<div class={s.mask}>{v + ""}</div>
				)}
			</div>
		</div>
	);
}
