import { h } from "preact";
import s from "./Sidebar.css";
import { Actions } from "../Actions";
import { IconBtn } from "../IconBtn";
import { Refresh, BugIcon, InspectNativeIcon } from "../icons";
import { useStore, useEmitter, useObserver } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { ComponentName } from "../ComponentName";

export function SidebarActions() {
	const store = useStore();
	const emit = useEmitter();
	const node = useObserver(
		() => store.nodes.$.get(store.selection.selected.$) || null,
	);
	const forceUpdate = useCallback(() => {
		if (node) emit("force-update", node.id);
	}, [node]);
	const log = useCallback(() => {
		if (node) emit("log", { id: node.id, children: node.children });
	}, [node]);
	const inspectHostNode = useCallback(() => {
		emit("inspect-host-node", null);
	}, []);

	return (
		<Actions class={s.actions}>
			<ComponentName>{node && node.name}</ComponentName>

			<div class={s.iconActions}>
				{node && (
					<IconBtn title="Show matching DOM element" onClick={inspectHostNode}>
						<InspectNativeIcon />
					</IconBtn>
				)}
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
	);
}
