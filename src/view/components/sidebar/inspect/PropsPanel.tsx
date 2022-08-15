import { h, Fragment } from "preact";
import { ElementProps, ChangeFn } from "./ElementProps";
import { SidebarPanel, Empty } from "../SidebarPanel";
import { NewProp } from "./NewProp";
import { Observable } from "../../../preact-signals";
import { PropData } from "./parseProps";
import { useStore } from "../../../store/react-bindings";
import { Message } from "../../Message/Message";

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
	const uncollapsed = props.uncollapsed.$;
	const items = props.items.$;
	const store = useStore();
	const isSupported = store.supports.hooks.$;

	return (
		<SidebarPanel title={label} onCopy={onCopy} testId={label}>
			{items.length ? (
				<Fragment>
					<ElementProps
						uncollapsed={uncollapsed}
						items={items}
						onChange={onChange}
						onCollapse={id => {
							const idx = props.uncollapsed.$.indexOf(id);
							const v = props.uncollapsed.$;

							idx > -1 ? v.splice(idx, 1) : v.push(id);
							props.uncollapsed.$ = [...v];
						}}
					/>
					{canAddNew && (
						<NewProp onChange={(v, path) => onChange(v, path, null)} />
					)}
				</Fragment>
			) : !isSupported && label === "Hooks" ? (
				<Message type="warning" testId="no-hooks-support-warning">
					Please upgrade to Preact &gt;=10.4.1 to enable hooks inspection.
				</Message>
			) : (
				<Empty>None</Empty>
			)}
		</SidebarPanel>
	);
}
