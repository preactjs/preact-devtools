import { h } from "preact";
import { ElementProps, ObjPath } from "./ElementProps";
import { useStore, useObserver } from "../../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { createPropsStore } from "../../../store/props";
import { useInstance } from "../../utils";
import { SidebarPanel } from "../SidebarPanel";
import { ID } from "../../../store/types";
import { InspectData } from "../../../../adapter/adapter/adapter";
import { NewProp } from "./NewProp";

const noop = () => null;

export interface Props {
	label: string;
	isOptional?: boolean;
	checkEditable: (data: InspectData) => boolean;
	getData(data: InspectData): any;
	canAddNew?: boolean;
	onChange: (id: ID, path: ObjPath, value: any) => void;
	onCopy?: (data: any) => void;
}

export function PropsPanel(props: Props) {
	const store = useStore();

	const s = useInstance(() => {
		return createPropsStore(store.inspectData, props.getData);
	});
	const inspect = useObserver(() => store.inspectData.$);
	const collapsed = useObserver(() => s.collapser.collapsed.$);
	const items = useObserver(() => s.list.$);

	const onChange = useCallback(
		(value: any, path: ObjPath) => {
			const key = path.slice(1);
			props.onChange(inspect!.id, key, value);
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
				onCollapse={s.collapser.toggle}
			/>
			{props.canAddNew && <NewProp onChange={onChange} />}
		</SidebarPanel>
	);
}
