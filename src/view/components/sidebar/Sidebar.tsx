import { h } from "preact";
import s from "./Sidebar.css";
import { useEmitter } from "../../store/react-bindings";
import { PropsPanel } from "./PropsPanel";
import { PropData } from "./parseProps";
import { Collapser } from "../../store/collapser";
import { SidebarActions } from "./SidebarActions";

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

	return (
		<aside class={s.root}>
			<SidebarActions />
			<div class={s.body}>
				<PropsPanel
					label="Props"
					getData={d => d.props}
					checkEditable={data => data.canEditProps}
					transform={collapseFn}
					onRename={(id, path, value) =>
						emit("rename-prop", { id, path, value })
					}
					onChange={(id, path, value) =>
						emit("update-prop", { id, path, value })
					}
				/>
				<PropsPanel
					label="State"
					isOptional
					getData={d => d.state}
					checkEditable={data => data.canEditState}
					transform={collapseFn}
					onRename={(id, path, value) =>
						emit("rename-state", { id, path, value })
					}
					onChange={(id, path, value) =>
						emit("update-state", { id, path, value })
					}
				/>
				<PropsPanel
					label="Context"
					isOptional
					getData={d => d.context}
					checkEditable={() => true}
					transform={collapseFn}
					onRename={(id, path, value) =>
						emit("rename-context", { id, path, value })
					}
					onChange={(id, path, value) =>
						emit("update-context", { id, path, value })
					}
				/>
				{/* {inspect != null && inspect.hooks && (
					<SidebarPanel title="hooks" empty="None"></SidebarPanel>
				)} */}
			</div>
		</aside>
	);
}
