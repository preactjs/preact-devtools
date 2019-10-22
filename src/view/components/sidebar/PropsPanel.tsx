import { h } from "preact";
import { ElementProps, ObjPath } from "./ElementProps";
import { useStore, useObserver } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { createPropsStore } from "../../store/props";
import { useInstance } from "../utils";
import { SidebarPanel } from "./SidebarPanel";
import { ID } from "../../store/types";
import { InspectData } from "../../../adapter/adapter";
import { Collapser } from "../../store/collapser";
import { PropData } from "./parseProps";
import { NewProp } from "./NewProp";

const noop = () => null;

export interface Props {
	label: string;
	isOptional?: boolean;
	checkEditable: (data: InspectData) => boolean;
	getData(data: InspectData): any;
	canAddNew?: boolean;
	transform: (
		data: PropData,
		collapser: Collapser<string>,
		shouldReset: boolean,
	) => PropData;
	onRename: (id: ID, path: ObjPath, value: any) => void;
	onChange: (id: ID, path: ObjPath, value: any) => void;
	onCopy?: (data: any) => void;
}

export function PropsPanel(props: Props) {
	const store = useStore();
	const s = useInstance(() => {
		return createPropsStore(store.inspectData, props.getData, props.transform);
	});
	const inspect = useObserver(() => store.inspectData.$);
	const collapsed = useObserver(() => s.collapser.collapsed.$);
	const items = useObserver(() => s.list.$);

	const onChange = useCallback(
		(value: any, path: ObjPath) => {
			props.onChange(inspect!.id, path.slice(1), value);
		},
		[inspect],
	);

	const onRename = useCallback(
		(value: any, path: ObjPath) => {
			if (inspect != null) {
				props.onRename(inspect.id, path, value);
			}
		},
		[inspect],
	);

	const onCopy = props.onCopy
		? useCallback(() => {
				if (inspect != null && props.onCopy != null) {
					props.onCopy(props.getData(inspect));
				}
		  }, [inspect, props.onCopy])
		: undefined;

	if (inspect == null || props.getData(inspect) == null) {
		return !props.isOptional ? (
			<SidebarPanel title={props.label} empty="None" onCopy={noop} />
		) : null;
	}

	return (
		<SidebarPanel title={props.label} empty="None" onCopy={onCopy}>
			<ElementProps
				nodeId={inspect.id}
				editable={props.checkEditable(inspect)}
				collapsed={collapsed}
				items={items.map(x => s.tree.$.get(x)!)}
				onChange={onChange}
				onRename={onRename}
				onCollapse={s.collapser.toggle}
			/>
			{props.canAddNew && <NewProp />}
		</SidebarPanel>
	);
}
