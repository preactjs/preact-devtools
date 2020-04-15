import { h } from "preact";
import { ElementProps } from "./ElementProps";
import { useStore, useObserver } from "../../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { createPropsStore, toggleCollapsed } from "../../../store/props";
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
	onChange: (id: ID, path: string, value: any) => void;
	onCopy?: (data: any) => void;
}

export function PropsPanel(props: Props) {
	const store = useStore();

	const s = useInstance(() => {
		return createPropsStore(
			store.inspectData,
			store.sidebarUncollapsed,
			props.getData,
		);
	});
	const inspect = useObserver(() => store.inspectData.$);
	const items = useObserver(() => s.list.$);

	const onChange = useCallback(
		(value: any, path: string) => {
			props.onChange(inspect!.id, path, value);
		},
		[inspect],
	);

	if (inspect == null || props.getData(inspect) == null) {
		return !props.isOptional ? (
			<SidebarPanel title={props.label} empty="None" onCopy={noop} />
		) : null;
	}

	return (
		<SidebarPanel
			title={props.label}
			empty="None"
			onCopy={() => {
				if (props.onCopy && inspect != null && props.onCopy != null) {
					props.onCopy(props.getData(inspect));
				}
			}}
		>
			<ElementProps
				editable={props.checkEditable(inspect)}
				uncollapsed={s.uncollapsed}
				items={items.map(x => s.tree.$.get(x)!)}
				onChange={onChange}
				onCollapse={id => toggleCollapsed(s.uncollapsed, id)}
			/>
			{props.canAddNew && <NewProp onChange={onChange} />}
		</SidebarPanel>
	);
}
