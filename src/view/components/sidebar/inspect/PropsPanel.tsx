import { h, Fragment } from "preact";
import { ElementProps, ChangeFn } from "./ElementProps";
import { SidebarPanel, Empty } from "../SidebarPanel";
import { NewProp } from "./NewProp";
import { Observable } from "../../../valoo";
import { PropData } from "./parseProps";
import { useObserver } from "../../../store/react-bindings";

export interface Props {
	label: string;
	isOptional?: boolean;
	uncollapsed: Observable<string[]>;
	items: Observable<PropData[]>;
	canAddNew?: boolean;
	onChange: ChangeFn;
	onCopy?: () => void;
}

export function PropsPanel(props: Props) {
	const { label, onCopy, onChange, canAddNew } = props;
	const uncollapsed = useObserver(() => props.uncollapsed.$);
	const items = useObserver(() => props.items.$);
	return (
		<SidebarPanel title={label} onCopy={onCopy}>
			{items.length ? (
				<Fragment>
					<ElementProps
						uncollapsed={uncollapsed}
						items={items}
						onChange={onChange}
						onCollapse={id => {
							const idx = props.uncollapsed.$.indexOf(id);
							props.uncollapsed.update(v => {
								idx > -1 ? v.splice(idx, 1) : v.push(id);
							});
						}}
					/>
					{canAddNew && (
						<NewProp onChange={(v, path) => onChange(v, path, null)} />
					)}
				</Fragment>
			) : (
				<Empty>None</Empty>
			)}
		</SidebarPanel>
	);
}
