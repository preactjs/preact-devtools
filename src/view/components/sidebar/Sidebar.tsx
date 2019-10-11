import { h } from "preact";
import s from "./Sidebar.css";
import { Actions } from "../Actions";
import { useObserver, useStore, useEmitter } from "../../store/react-bindings";
import { IconBtn } from "../IconBtn";
import { BugIcon, Refresh } from "../icons";
import { useCallback } from "preact/hooks";
import { PropsPanel } from "./PropsPanel";
import { PropData } from "../../parseProps";
import { Collapser } from "../../store/collapser";

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
	const store = useStore();
	const emit = useEmitter();
	const node = useObserver(
		() => store.nodes.$.get(store.selection.selected.$) || null,
	);
	const forceUpdate = useCallback(() => {
		if (node) emit("force-update", node.id);
	}, [node]);
	const log = useCallback(() => {
		if (node) emit("log", node.id);
	}, [node]);

	return (
		<aside class={s.root}>
			<Actions class={s.actions}>
				<span class={s.title}>{node ? node.name : "-"}</span>

				<div class={s.iconActions}>
					{node && node.name[0] === node.name[0].toUpperCase() && (
						<IconBtn title="Re-render Component" onClick={forceUpdate}>
							<Refresh />
						</IconBtn>
					)}
					{node && (
						<IconBtn title="Log internal vnode" onClick={log}>
							<BugIcon />
						</IconBtn>
					)}
				</div>
			</Actions>
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
