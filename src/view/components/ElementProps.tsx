import { h } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "./TreeView";
import { PropDataType, PropData } from "../parseProps";
import { AutoSizeInput } from "./AutoSizeInput";
import { DataInput } from "./DataInput";
import { useObserver, ID } from "../store";
import { Collapser } from "../store/collapser";
import { Observable } from "../valoo";
import { displayCollection } from "./DataInput/parseValue";

export type ObjPath = Array<string | number>;
export type ChangeFn = (value: any, path: ObjPath) => void;

export interface Props {
	nodeId: ID;
	editable?: boolean;
	onChange?: ChangeFn;
	onRename?: ChangeFn;
	collapser: Collapser<string>;
	nodeList: Observable<string[]>;
	tree: Observable<Map<string, PropData>>;
}

export function ElementProps(props: Props) {
	const { editable, onChange, onRename, collapser } = props;

	const collapsed = useObserver(() => collapser.collapsed.$);
	const list = useObserver(() => props.nodeList.$);

	return (
		<div class={s.root}>
			<form
				class={s.form}
				onSubmit={e => {
					e.preventDefault();
				}}
			>
				{list.map(id => {
					const item = props.tree.$.get(id);
					if (!item) return null;

					return (
						<SingleItem
							key={id}
							type={item.type}
							name={id.slice(id.lastIndexOf(".") + 1)}
							collapseable={item.collapsable}
							collapsed={collapsed.has(id)}
							onCollapse={() => collapser.toggle(id)}
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
	const onCollapseClick = () => onCollapse && onCollapse(path);

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
					<div class={s.mask}>{displayCollection(v)}</div>
				)}
			</div>
		</div>
	);
}
