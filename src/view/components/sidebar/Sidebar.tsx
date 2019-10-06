import { h } from "preact";
import s from "./Sidebar.css";
import { Actions } from "../Actions";
import { useObserver, useStore, useEmitter } from "../../store/react-bindings";
import { IconBtn } from "../IconBtn";
import { BugIcon, Refresh } from "../icons";
import { useCallback } from "preact/hooks";
import { PropsPanel } from "./PropsPanel";
import { StatePanel } from "./StatePanel";

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
				<PropsPanel />
				{/* <StatePanel /> */}
				{/* {inspect != null && inspect.context && (
					<SidebarPanel title="context" empty="None"></SidebarPanel>
				)}
				{inspect != null && inspect.hooks && (
					<SidebarPanel title="hooks" empty="None"></SidebarPanel>
				)} */}
			</div>
		</aside>
	);
}
