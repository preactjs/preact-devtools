import { h } from "preact";
import s from "./Sidebar.css";
import { Actions } from "../Actions";
import { IconBtn } from "../IconBtn";
import { Refresh, BugIcon } from "../icons";
import { useStore, useEmitter, useObserver } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";

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
		if (node) emit("log", node.id);
	}, [node]);

	return (
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
	);
}
