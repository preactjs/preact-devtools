import { h } from "preact";
import { ElementProps } from "./ElementProps";
import { useStore, useObserver } from "../../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { createPropsStore, toggleCollapsed } from "../../../store/props";
import { useInstance } from "../../utils";
import { SidebarPanel, Empty } from "../SidebarPanel";
import { ID, Store } from "../../../store/types";
import { InspectData } from "../../../../adapter/adapter/adapter";
import { NewProp } from "./NewProp";
import { Observable } from "../../../valoo";

const noop = () => null;

export interface Props {
	label: string;
	isOptional?: boolean;
	getData(data: InspectData): any;
	getUncollapsed: (store: Store) => Observable<string[]>;
	canAddNew?: boolean;
	onChange: (id: ID, path: string, value: any) => void;
	onCopy?: (data: any) => void;
}

export function PropsPanel(props: Props) {
	const store = useStore();
	const uncollapsed = useObserver(() => props.getUncollapsed(store));
	const s = useInstance(() => {
		return createPropsStore(store.inspectData, uncollapsed, props.getData);
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
			<SidebarPanel title={props.label} onCopy={noop}>
				<Empty>None</Empty>
			</SidebarPanel>
		) : null;
	}

	return (
		<SidebarPanel
			title={props.label}
			onCopy={() => {
				if (props.onCopy && inspect != null && props.onCopy != null) {
					props.onCopy(props.getData(inspect));
				}
			}}
		>
			<ElementProps
				uncollapsed={uncollapsed}
				items={items}
				onChange={onChange}
				onCollapse={id => toggleCollapsed(uncollapsed, id)}
			/>
			{props.canAddNew && <NewProp onChange={onChange} />}
		</SidebarPanel>
	);
}
