import { h } from "preact";
import { TreeView } from "./components/TreeView";
import { Sidebar } from "./components/Sidebar";
import s from "./Devtools.css";
import { TreeBar } from "./components/TreeBar";

export function DevTools() {
	return (
		<div class={s.root}>
			<div class={s.components}>
				<TreeBar />
				<TreeView
					nodes={[
						{ depth: -1, id: 1, name: "foo", parentId: -1, type: 2 },
						{ depth: 1, id: 2, name: "Hydrator", parentId: 1, type: 2 },
						{ depth: 2, id: 3, name: "bar", parentId: 2, type: 2 },
						{ depth: 1, id: 4, name: "Memomamo", parentId: 1, type: 2 },
						{ depth: 2, id: 5, name: "bar", parentId: 4, type: 2 },
						{ depth: 2, id: 6, name: "bar", parentId: 4, type: 2 },
					]}
				/>
			</div>
			<div class={s.sidebar}>
				<Sidebar title="Hydrator" />
			</div>
		</div>
	);
}

export const instance = <DevTools />;
