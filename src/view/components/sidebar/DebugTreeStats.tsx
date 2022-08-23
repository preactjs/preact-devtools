import { h } from "preact";
import { useObserver, useStore } from "../../store/react-bindings";
import { SidebarPanel } from "./SidebarPanel";

export function DebugTreeStats() {
	const store = useStore();
	const nodeList = useObserver(() => store.nodeList.value);

	return (
		<SidebarPanel title="Debug Tree Stats" testId="tree-debug-stats">
			<dl>
				<dt>Active VNode Count</dt>
				<dd>{nodeList.length}</dd>
			</dl>
		</SidebarPanel>
	);
}
