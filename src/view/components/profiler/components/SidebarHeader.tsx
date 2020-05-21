import { h } from "preact";
import { Actions } from "../../Actions";
import s from "../../sidebar/Sidebar.css";
import {
	useStore,
	useObserver,
	useEmitter,
} from "../../../store/react-bindings";
import { ComponentName } from "../../ComponentName";
import { useCallback } from "preact/hooks";
import { IconBtn } from "../../IconBtn";
import { BugIcon, InspectNativeIcon } from "../../icons";

export function SidebarHeader() {
	const store = useStore();
	const selected = useObserver(() => store.profiler.selectedNode.$);
	const emit = useEmitter();
	const log = useCallback(() => {
		if (selected) emit("log", { id: selected.id, children: selected.children });
	}, [selected]);
	const inspectHostNode = useCallback(() => {
		emit("inspect-host-node", null);
	}, []);

	return (
		<Actions class={s.actions}>
			<ComponentName>{selected && selected.name}</ComponentName>
			<div class={s.iconActions}>
				{selected && (
					<IconBtn title="Show matching DOM element" onClick={inspectHostNode}>
						<InspectNativeIcon />
					</IconBtn>
				)}
				{selected && (
					<IconBtn title="Log internal vnode" onClick={log}>
						<BugIcon />
					</IconBtn>
				)}
			</div>
		</Actions>
	);
}
