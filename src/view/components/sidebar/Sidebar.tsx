import { h, Fragment } from "preact";
import s from "./Sidebar.css";
import { useEmitter } from "../../store/react-bindings";
import { PropsPanel } from "./PropsPanel";
import { PropData } from "./parseProps";
import { Collapser } from "../../store/collapser";
import { serializeProps } from "./serializeProps";
import { useCallback } from "preact/hooks";

const collapseFn = (
	data: PropData,
	collapser: Collapser<any>,
	shouldReset: boolean,
) => {
	if (data.children.length > 0) {
		data.collapsable = true;
		if (shouldReset) {
			collapser.collapsed.$.add(data.id);
		}
	}
	return data;
};

export function Sidebar() {
	const emit = useEmitter();

	const onCopy = useCallback((v: any) => emit("copy", serializeProps(v)), []);

	return (
		<Fragment>
			<PropsPanel
				label="Props"
				getData={d => d.props}
				checkEditable={data => data.canEditProps}
				transform={collapseFn}
				onChange={(id, path, value) => emit("update-prop", { id, path, value })}
				onCopy={onCopy}
				canAddNew
			/>
			<PropsPanel
				label="State"
				isOptional
				getData={d => d.state}
				checkEditable={data => data.canEditState}
				transform={collapseFn}
				onChange={(id, path, value) =>
					emit("update-state", { id, path, value })
				}
				onCopy={onCopy}
			/>
			<PropsPanel
				label="Context"
				isOptional
				getData={d => d.context}
				checkEditable={() => true}
				transform={collapseFn}
				onChange={(id, path, value) =>
					emit("update-context", { id, path, value })
				}
				onCopy={onCopy}
			/>
			{/* {inspect != null && inspect.hooks && (
					<SidebarPanel title="hooks" empty="None"></SidebarPanel>
				)} */}
		</Fragment>
	);
}
