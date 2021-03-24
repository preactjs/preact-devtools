import { h, Fragment } from "preact";
import s from "./Sidebar.module.css";
import { Actions } from "../Actions";
import { IconBtn } from "../IconBtn";
import { BugIcon, InspectNativeIcon, CodeIcon, SuspendIcon } from "../icons";
import { useStore, useEmitter, useObserver } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { ComponentName } from "../ComponentName";
import { DevNodeType } from "../../store/types";

export function SidebarActions() {
	const store = useStore();
	const emit = useEmitter();
	const node = useObserver(
		() => store.nodes.$.get(store.selection.selected.$) || null,
	);
	const log = useCallback(() => {
		if (node) emit("log", { id: node.id, children: node.children });
	}, [node]);
	const inspectHostNode = useCallback(() => {
		emit("inspect-host-node", null);
	}, []);
	const viewSource = useCallback(() => {
		if (node) {
			emit("view-source", node.id);
		}
	}, [node]);

	const canViewSource =
		node &&
		node.type !== DevNodeType.Group &&
		node.type !== DevNodeType.Element;

	const suspense = useObserver(() => {
		const state = {
			canSuspend: false,
			suspended: false,
		};

		if (store.inspectData.$) {
			state.canSuspend = store.inspectData.$.canSuspend;
			state.suspended = store.inspectData.$.suspended;
		}

		return state;
	});
	const onSuspend = useCallback(() => {
		if (node) {
			emit("suspend", { id: node.id, active: !suspense.suspended });
		}
	}, [node, suspense]);

	return (
		<Actions class={s.actions}>
			<ComponentName>{node && node.name}</ComponentName>

			<div class={s.iconActions}>
				{node && (
					<Fragment>
						{suspense.canSuspend && (
							<IconBtn
								title="Suspend Tree"
								testId="suspend-action"
								active={suspense.suspended}
								onClick={onSuspend}
							>
								<SuspendIcon />
							</IconBtn>
						)}
						<IconBtn
							title="Show matching DOM element"
							onClick={inspectHostNode}
						>
							<InspectNativeIcon />
						</IconBtn>
						<IconBtn title="Log internal vnode" onClick={log}>
							<BugIcon />
						</IconBtn>
						<IconBtn
							title="View Component Source"
							onClick={viewSource}
							disabled={!canViewSource}
						>
							<CodeIcon />
						</IconBtn>
					</Fragment>
				)}
			</div>
		</Actions>
	);
}
