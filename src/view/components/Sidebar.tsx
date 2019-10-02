import { h } from "preact";
import s from "./Sidebar.css";
import { SidebarPanel } from "./SidebarPanel";
import { Actions } from "./Actions";
import { useObserver, useStore } from "../store";
import { IconBtn } from "./IconBtn";
import { ElementProps } from "./ElementProps";
import { BugIcon, Refresh } from "./icons";

export function Sidebar() {
	const store = useStore();
	const node = useObserver(
		() => store.nodes.$.get(store.selection.selected.$) || null,
	);
	const inspect = useObserver(() => store.inspectData.$);

	return (
		<aside class={s.root}>
			<Actions class={s.actions}>
				<span class={s.title}>{node ? node.name : "-"}</span>

				<div class={s.iconActions}>
					{node && node.name[0] === node.name[0].toUpperCase() && (
						<IconBtn
							title="Re-render Component"
							onClick={() => store.actions.forceUpdate(node.id)}
						>
							<Refresh />
						</IconBtn>
					)}
					{node && (
						<IconBtn
							title="Log internal vnode"
							onClick={() => store.actions.logNode(node.id)}
						>
							<BugIcon />
						</IconBtn>
					)}
				</div>
			</Actions>
			<div class={s.body}>
				<SidebarPanel title="props" empty="None">
					{inspect.props != null && node != null ? (
						<ElementProps
							nodeId={inspect.id}
							data={inspect.props}
							editable={inspect.canEditProps}
							onChange={(v, path) =>
								store.actions.updateNode(node.id, "props", path, v)
							}
							onRename={(v, path) => {
								store.actions.updatePropertyName(node.id, "props", path, v);
							}}
						/>
					) : null}
				</SidebarPanel>
				{inspect.state && (
					<SidebarPanel title="state" empty="None">
						{inspect.state ? (
							<ElementProps
								nodeId={inspect.id}
								data={inspect.state}
								editable={inspect.canEditState}
								onChange={(v, path) =>
									node && store.actions.updateNode(node.id, "state", path, v)
								}
							/>
						) : null}
					</SidebarPanel>
				)}
				{inspect.context && (
					<SidebarPanel title="context" empty="None"></SidebarPanel>
				)}
				{inspect.hooks && (
					<SidebarPanel title="hooks" empty="None"></SidebarPanel>
				)}
			</div>
		</aside>
	);
}
