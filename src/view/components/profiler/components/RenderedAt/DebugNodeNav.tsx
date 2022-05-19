import { h } from "preact";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { SidebarPanel, Empty } from "../../../sidebar/SidebarPanel";
import s from "./RenderedAt.module.css";
import { DevNode, DevNodeType } from "../../../../store/types";

export function DebugNodeNav() {
	const store = useStore();
	const selected = useObserver(() => store.profiler.selectedNodeId.$);
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const nodes = useObserver(() => {
		const commit = store.profiler.activeCommit.$;
		if (!commit) return [];

		const out: DevNode[] = [];
		const stack = [commit.rootId];
		let item;
		while ((item = stack.pop())) {
			const node = commit.nodes.get(item);
			if (!node) continue;

			out.push(node);
			for (let i = node.children.length - 1; i >= 0; i--) {
				stack.push(node.children[i]);
			}
		}

		return out;
	});
	const isRecording = useObserver(() => store.profiler.isRecording.$);

	if (isRecording || !commit) {
		return null;
	}

	const commitRoot = commit.nodes.get(commit.commitRootId)!;

	const rootIds = new Set(
		commitRoot.type === DevNodeType.Group
			? commitRoot.children
			: [commitRoot.id],
	);

	return (
		<SidebarPanel title="Debug Node Navigation:" testId="profiler-debug-nav">
			{nodes.length === 0 ? (
				<Empty>No nodes found inside commmit</Empty>
			) : (
				<nav data-testid="debug-nav">
					{nodes.map(node => {
						return (
							<button
								key={node.id}
								class={s.item}
								data-active={selected === node.id}
								onClick={() => (store.profiler.selectedNodeId.$ = node.id)}
							>
								<span style="display: flex; justify-content: space-between; width: 100%">
									<span>
										{node.name}
										{rootIds.has(node.id) && <b> (R)</b>}
									</span>
									<span>{node.id}</span>
								</span>
							</button>
						);
					})}
				</nav>
			)}
		</SidebarPanel>
	);
}
