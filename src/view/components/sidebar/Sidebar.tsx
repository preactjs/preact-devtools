import { h, Fragment } from "preact";
import { useEmitter } from "../../store/react-bindings";
import { PropsPanel } from "./inspect/PropsPanel";
import { serializeProps } from "./inspect/serializeProps";
import { useCallback } from "preact/hooks";

export function Sidebar() {
	const emit = useEmitter();

	const onCopy = useCallback((v: any) => emit("copy", serializeProps(v)), []);

	return (
		<Fragment>
			<PropsPanel
				label="Props"
				getData={d => d.props}
				getUncollapsed={store => store.sidebarUncollapsed.props}
				checkEditable={data => data.canEditProps}
				onChange={(id, path, value) => emit("update-prop", { id, path, value })}
				onCopy={onCopy}
				canAddNew
			/>
			<PropsPanel
				label="State"
				isOptional
				getData={d => d.state}
				getUncollapsed={store => store.sidebarUncollapsed.state}
				checkEditable={data => data.canEditState}
				onChange={(id, path, value) =>
					emit("update-state", { id, path, value })
				}
				onCopy={onCopy}
			/>
			<PropsPanel
				label="Context"
				isOptional
				getData={d => d.context}
				getUncollapsed={store => store.sidebarUncollapsed.context}
				checkEditable={() => true}
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
