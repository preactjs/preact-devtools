import { h } from "preact";
import { ElementProps, ObjPath } from "../ElementProps";
import { useStore, useObserver, useEmitter } from "../../store/react-bindings";
import { useCallback } from "preact/hooks";
import { createPropsStore } from "../../store/props";
import { useInstance } from "../utils";
import { SidebarPanel } from "./SidebarPanel";

export function PropsPanel() {
	const store = useStore();
	const emit = useEmitter();
	const s = useInstance(() => {
		return createPropsStore(store.inspectData, store.selection.selected, emit);
	});
	const inspect = useObserver(() => store.inspectData.$);

	const onChange = useCallback(
		(value: any, path: ObjPath) => {
			emit("update-prop", { id: inspect!.id, path, value });
		},
		[inspect],
	);

	const onRename = useCallback(
		(value: any, path: ObjPath) => {
			emit("rename-prop", { id: inspect!.id, path, value });
		},
		[inspect],
	);

	if (inspect == null || inspect.props == null) {
		return <SidebarPanel title="props" empty="None" />;
	}

	return (
		<SidebarPanel title="props" empty="None">
			<ElementProps
				nodeId={inspect.id}
				editable={inspect.canEditProps}
				collapser={s.collapser}
				nodeList={s.list}
				tree={s.tree}
				onChange={onChange}
				onRename={onRename}
			/>
		</SidebarPanel>
	);
}
