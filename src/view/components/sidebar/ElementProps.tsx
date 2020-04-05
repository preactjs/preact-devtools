import { h } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "../elements/TreeView";
import { PropDataType, PropData } from "./parseProps";
import { DataInput } from "../DataInput";
import { displayCollection } from "../DataInput/parseValue";
import { ID } from "../../store/types";
import { useCallback } from "preact/hooks";

export type ObjPath = Array<string | number>;
export type ChangeFn = (value: any, path: ObjPath) => void;

export interface Props {
	nodeId: ID;
	editable?: boolean;
	onChange?: ChangeFn;
	onCollapse?: (path: string) => void;
	collapsed: Set<string>;
	items: PropData[];
}

export function ElementProps(props: Props) {
	const { editable, onChange, collapsed, items, onCollapse, nodeId } = props;

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
							id={nodeId}
							key={id}
							type={item.type}
							name={id.slice(id.lastIndexOf(".") + 1)}
							collapseable={item.collapsable}
							collapsed={collapsed.has(id)}
							onCollapse={() => onCollapse && onCollapse(id)}
							editable={editable && item.editable}
							value={item.value}
							path={item.path}
							onChange={onChange}
							depth={item.depth}
						/>
					);
				})}
			</form>
		</div>
	);
}

export interface SingleProps {
	id: ID;
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
}

export function SingleItem(props: SingleProps) {
	const {
		id,
		onChange,
		path,
		editable = false,
		name,
		type,
		collapseable = false,
		collapsed = false,
		depth,
		onCollapse,
		value,
	} = props;

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

	return (
		<div
			key={path.join(".")}
			class={s.row}
			data-testid="props-row"
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
					<span class={s.name} data-type={type}>
						<span class={s.nameStatic}>{name}</span>
					</span>
				</button>
			)}
			{!collapseable && (
				<span class={`${s.name} ${s.noCollapse}`} data-type={type}>
					<span class={`${s.nameStatic} ${editable ? s.nameEditable : ""}`}>
						{name}
					</span>
				</span>
			)}
			<div class={s.property}>
				{editable ? (
					<DataInput
						value={value}
						onChange={update}
						name={`${id}#${path.join(".")}`}
					/>
				) : (
					<div class={s.mask}>{displayCollection(value)}</div>
				)}
			</div>
		</div>
	);
}
