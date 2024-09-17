import { Fragment, h } from "preact";
import { Actions } from "../Actions.tsx";
import { IconBtn } from "../IconBtn.tsx";
import { useEmitter, useStore } from "../../store/react-bindings.ts";
import { useCallback } from "preact/hooks";
import { ComponentName } from "../ComponentName.tsx";
import { DevNodeType } from "../../store/types.ts";
import { Icon } from "../icons.tsx";
import { useComputed } from "@preact/signals";

export function SidebarActions() {
	const store = useStore();
	const emit = useEmitter();
	const node = store.nodes.value.get(store.selection.selected.value) || null;
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

	const canViewSource = node &&
		node.type !== DevNodeType.Group &&
		node.type !== DevNodeType.Element;

	const suspense = useComputed(() => {
		const state = {
			canSuspend: false,
			suspended: false,
		};

		if (store.inspectData.value) {
			state.canSuspend = store.inspectData.value.canSuspend;
			state.suspended = store.inspectData.value.suspended;
		}

		return state;
	}).value;
	const onSuspend = useCallback(() => {
		if (node) {
			emit("suspend", { id: node.id, active: !suspense.suspended });
		}
	}, [node, suspense]);

	return (
		<Actions class="sidebar-actions">
			<ComponentName>{node && node.name}</ComponentName>

			<div class="sidebar-icon-actions">
				{node && (
					<Fragment>
						{suspense.canSuspend && (
							<IconBtn
								title="Suspend Tree"
								testId="suspend-action"
								active={suspense.suspended}
								onClick={onSuspend}
							>
								<Icon icon="suspend-icon" />
							</IconBtn>
						)}
						<IconBtn
							title="Show matching DOM element"
							onClick={inspectHostNode}
						>
							<Icon icon="inspect" />
						</IconBtn>
						<IconBtn title="Log internal vnode" onClick={log}>
							<Icon icon="bug" />
						</IconBtn>
						<IconBtn
							title="View Component Source"
							onClick={viewSource}
							disabled={!canViewSource}
						>
							<Icon icon="code-icon" />
						</IconBtn>
					</Fragment>
				)}
			</div>
		</Actions>
	);
}
