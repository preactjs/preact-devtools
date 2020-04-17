import { h, Fragment } from "preact";
import s from "./ElementProps.css";
import { Arrow } from "../../elements/TreeView";
import { PropDataType, PropData } from "./parseProps";
import { DataInput } from "../../DataInput";
import { genPreview } from "../../DataInput/parseValue";
import { Observable } from "../../../valoo";
import { isCollapsed } from "../../../store/props";

export type ChangeFn = (value: any, path: string) => void;

export interface Props {
	onChange?: ChangeFn;
	onCollapse?: (path: string) => void;
	uncollapsed: Observable<string[]>;
	items: PropData[];
}

export function ElementProps(props: Props) {
	const { onChange, uncollapsed, items, onCollapse } = props;

	return (
		<div class={s.root}>
			<form class={s.form} onSubmit={e => e.preventDefault()}>
				{items.map(item => {
					const id = item.id;
					return (
						<SingleItem
							id={id}
							key={id}
							type={item.type}
							name={id.slice(id.lastIndexOf(".") + 1)}
							collapseable={item.children.length > 0}
							collapsed={isCollapsed(uncollapsed.$, id)}
							onCollapse={() => onCollapse && onCollapse(id)}
							editable={item.editable}
							value={item.value}
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
	id: string;
	key?: string;
	editable?: boolean;
	type: PropDataType;
	collapseable?: boolean;
	collapsed?: boolean;
	name: string;
	value: any;
	onChange?: ChangeFn;
	onCollapse?: (path: string) => void;
	depth: number;
}

export function SingleItem(props: SingleProps) {
	const {
		id,
		onChange,
		editable = false,
		name,
		type,
		collapseable = false,
		collapsed = false,
		depth,
		onCollapse,
		value,
	} = props;

	return (
		<div
			key={id}
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
					onClick={() => onCollapse && onCollapse(id)}
				>
					<Arrow />
					<span class={s.name} data-type={type}>
						{name}
					</span>
					<span class={s.property} data-testid="prop-value">
						<span class={s.mask}>{genPreview(value)}</span>
					</span>
				</button>
			)}
			{!collapseable && (
				<Fragment>
					<span
						class={`${s.name} ${s.noCollapse} ${s.nameStatic} ${
							editable ? s.nameEditable : ""
						}`}
						data-type={type}
					>
						{name}
					</span>
					<div class={s.property} data-testid="prop-value">
						{editable ? (
							<DataInput
								value={value}
								onChange={v => onChange && onChange(v, id)}
								name={`${id}`}
							/>
						) : (
							<div class={s.mask}>{genPreview(value)}</div>
						)}
					</div>
				</Fragment>
			)}
		</div>
	);
}
