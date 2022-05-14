import { h, Fragment } from "preact";
import { Actions } from "../../Actions";
import s from "../../sidebar/Sidebar.module.css";
import {
	useStore,
	useObserver,
	useEmitter,
} from "../../../store/react-bindings";
import { ComponentName } from "../../ComponentName";
import { useCallback } from "preact/hooks";
import { IconBtn } from "../../IconBtn";
import { BugIcon, InspectNativeIcon, CodeIcon } from "../../icons";
import { DevNodeType } from "../../../store/types";

export function SidebarHeader() {
	const store = useStore();
	const selectedNode = useObserver(() => {
		const id = store.profiler.selectedNodeId.$;
		return store.profiler.nodes.$.get(id);
	});

	const emit = useEmitter();
	const log = useCallback(() => {
		if (selectedNode) emit("log", { id: selectedNode.id });
	}, [selectedNode]);
	const inspectHostNode = useCallback(() => {
		emit("inspect-host-node", null);
	}, []);
	const viewSource = useCallback(() => {
		if (selectedNode) {
			emit("view-source", selectedNode.id);
		}
	}, [selectedNode]);

	const canViewSource =
		selectedNode &&
		selectedNode.type !== DevNodeType.Group &&
		selectedNode.type !== DevNodeType.Element;

	return (
		<Actions class={s.actions}>
			<ComponentName>{selectedNode && selectedNode.name}</ComponentName>
			<div class={s.iconActions}>
				{selectedNode && (
					<Fragment>
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
