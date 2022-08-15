import { h } from "preact";
import { useStore } from "../../store/react-bindings";
import { SidebarPanel } from "./SidebarPanel";

export function DebugTreeStats() {
	const store = useStore();
	const nodeList = store.nodeList.$;

	return (
		<SidebarPanel title="Debug Tree Stats" testId="tree-debug-stats">
			<dl>
				<dt>Active VNode Count</dt>
				<dd>{nodeList.length}</dd>
			</dl>
		</SidebarPanel>
	);
}
