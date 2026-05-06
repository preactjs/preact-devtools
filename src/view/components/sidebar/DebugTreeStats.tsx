import { h } from "preact";
import { useStore } from "../../store/react-bindings";
import { useTreeStructureVersion } from "../../store/tree-hooks";
import { SidebarPanel } from "./SidebarPanel";

export function DebugTreeStats() {
	const store = useStore();
	useTreeStructureVersion();

	return (
		<SidebarPanel title="Debug Tree Stats" testId="tree-debug-stats">
			<div style="padding-left: 0.35rem">
				<dl>
					<dt>Active displayed node count</dt>
					<dd>{store.tree.visibleSize()}</dd>
					<dt>Selected node index</dt>
					<dd>{store.selection.selectedIdx.value}</dd>
				</dl>
			</div>
		</SidebarPanel>
	);
}
