import { h } from "preact";
import { ElementProps, ObjPath } from "../ElementProps";
import { useStore, useObserver, useEmitter } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { createPropsStore } from "../../store/props";
import { useInstance } from "../utils";
import { SidebarPanel } from "./SidebarPanel";

// TODO: Abstract
export function StatePanel() {
	const store = useStore();
	const emit = useEmitter();
	const s = useInstance(() => {
		return createPropsStore(store.inspectData, store.selection.selected, emit);
	});
	const inspect = useObserver(() => store.inspectData.$);
	const collapsed = useObserver(() => s.collapser.collapsed.$);
	const items = useObserver(() => s.list.$);

	const onChange = useCallback(
		(value: any, path: ObjPath) => {
			emit("update-prop", { id: inspect!.id, path: path.slice(1), value });
		},
		[inspect],
	);

	const onRename = useCallback(
		(value: any, path: ObjPath) => {
			emit("rename-prop", { id: inspect!.id, path, value });
		},
		[inspect],
	);

	if (inspect == null || inspect.state == null) {
		return null;
	}

	return (
		<SidebarPanel title="state" empty="None">
			<ElementProps
				nodeId={inspect.id}
				editable={inspect.canEditState}
				collapsed={collapsed}
				items={items.map(x => s.tree.$.get(x)!)}
				onChange={onChange}
				onRename={onRename}
				onCollapse={s.collapser.toggle}
			/>
		</SidebarPanel>
	);
}
