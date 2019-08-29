import { h, Fragment } from "preact";
import s from "./Sidebar.css";
import { SidebarPanel } from "./SidebarPanel";
import { Actions } from "./Actions";
import { useObserver, useStore } from "../store";
import { IconBtn } from "./IconBtn";

export function Sidebar() {
	const store = useStore();
	const node = useObserver(() => store.selected(), [store.selected]);
	const inspect = useObserver(() => store.inspectData(), [store.inspectData]);

	console.log("sidebar");
	return (
		<aside class={s.root}>
			<Actions>
				<span class={s.title}>{node ? node.name : "-"}</span>
				{node && (
					<Fragment>
						<IconBtn onClick={() => store.actions.logNode(node.id)}>
							Log
						</IconBtn>
					</Fragment>
				)}
			</Actions>
			<div class={s.body}>
				<SidebarPanel title="props" empty="None">
					{inspect.props ? JSON.stringify(inspect.props) : null}
				</SidebarPanel>
				{inspect.state && (
					<SidebarPanel title="state" empty="None">
						{inspect.state ? JSON.stringify(inspect.state) : null}
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
