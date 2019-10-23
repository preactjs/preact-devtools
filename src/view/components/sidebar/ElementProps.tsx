import { h } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "../TreeView";
import { PropDataType, PropData } from "./parseProps";
import { DataInput } from "../DataInput";
import { displayCollection } from "../DataInput/parseValue";
import { ID } from "../../store/types";
import { useCallback } from "preact/hooks";
import { useObserver, useStore } from "../../store/react-bindings";
import { Observable } from "../../valoo";

export type ObjPath = Array<string | number>;
export type ChangeFn = (value: any, path: ObjPath) => void;

export interface Props {
	nodeId: ID;
	editable?: boolean;
	onChange?: ChangeFn;
	onCollapse?: (path: string) => void;
	collapsed: Set<string>;
	items: PropData[];
	initial: Map<string, Observable<any>>;
}

export function ElementProps(props: Props) {
	const { editable, onChange, collapsed, items, onCollapse } = props;

	return (
		<div class={s.root}>
			<form
				class={s.form}
				onSubmit={e => {
					e.preventDefault();
				}}
			>
				{items.map(item => {
					const id = item.id;
					return (
						<SingleItem
							key={id}
							type={item.type}
							name={id.slice(id.lastIndexOf(".") + 1)}
							collapseable={item.collapsable}
							collapsed={collapsed.has(id)}
							onCollapse={() => onCollapse && onCollapse(id)}
							editable={editable}
							value={item.value}
							path={item.path}
							onChange={onChange}
							depth={item.depth}
							initial={props.initial.get(id)!}
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
	onCollapse?: (path: ObjPath) => void;
	depth: number;
	initial: Observable<any>;
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
		onCollapse,
		initial,
	} = props;

	const v = props.value;
	const update = useCallback(
		(v: any) => {
			onChange && onChange(v, path);
		},
		[onChange, path],
	);

	const onCollapseClick = useCallback(() => onCollapse && onCollapse(path), [
		onCollapse,
		path,
	]);

	const init = useObserver(() => initial.$);

	return (
		<div
			key={path.join(".")}
			class={s.row}
			data-depth={depth}
			style={`padding-left: calc(var(--indent-depth) * ${depth - 1})`}
		>
			{collapseable && (
				<button
					class={s.toggle}
					type="button"
					data-collapsed={collapsed}
					onClick={onCollapseClick}
				>
					<Arrow />
				</button>
			)}
			<div
				class={`${s.name} ${!collapseable ? s.noCollapse : ""}`}
				data-type={type}
			>
				<span class={s.nameStatic}>{name}</span>
			</div>
			<div class={s.property}>
				{editable ? (
					<DataInput value={v} onChange={update} initialValue={init} />
				) : (
					<div class={s.mask}>{displayCollection(v)}</div>
				)}
			</div>
		</div>
	);
}
