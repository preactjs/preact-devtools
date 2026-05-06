import { h } from "preact";
import { useStore } from "../../store/react-bindings";
import { DevNode } from "../../store/types";
import { SidebarPanel } from "../sidebar/SidebarPanel";

export function OwnerInfo() {
	const store = useStore();

	const selectedId = store.selection.selected.value;

	const data: DevNode[] = [];
	let id = selectedId;
	let current: DevNode | null;
	while ((current = store.tree.get(id)) !== null) {
		store.tree.versionOfNode(current.id).value;
		const owner = store.tree.get(current.owner);
		if (!owner) {
			break;
		}
		store.tree.versionOfNode(owner.id).value;
		data.push(owner);
		id = current.owner;
	}

	if (selectedId === -1) {
		return null;
	}

	return (
		<SidebarPanel title="Rendered by">
			<div class="rendered-by-wrapper">
				<nav data-testid="owners">
					{data.map(node => {
						return (
							<button
								key={node.id}
								class="rendered-at-item"
								data-active={selectedId === node.id}
								onClick={() => {
									store.selection.selectById(node.id);
								}}
							>
								{node.name}
							</button>
						);
					})}
				</nav>
				<p class="sidebar-preact-version">
					Preact@{store.inspectData.value?.version || ""}
				</p>
			</div>
		</SidebarPanel>
	);
}
