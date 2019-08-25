import { h } from "preact";
import { TreeView } from "./TreeView";
import { Sidebar } from "./Sidebar";
import s from "./Devtools.css";
import { TreeBar } from "./TreeBar";
import { AppCtx, Store } from "../store";

// [
// 	{
// 		depth: -1,
// 		id: 1,
// 		name: "foo",
// 		parentId: -1,
// 		type: 2,
// 		children: [2, 4],
// 	},
// 	{
// 		depth: 1,
// 		id: 2,
// 		name: "Hydrator",
// 		parentId: 1,
// 		type: 2,
// 		children: [3],
// 	},
// 	{
// 		depth: 2,
// 		id: 3,
// 		name: "bar",
// 		parentId: 2,
// 		type: 2,
// 		children: [],
// 	},
// 	{
// 		depth: 1,
// 		id: 4,
// 		name: "Memomamo",
// 		parentId: 1,
// 		type: 2,
// 		children: [5, 6],
// 	},
// 	{
// 		depth: 2,
// 		id: 5,
// 		name: "bar",
// 		parentId: 4,
// 		type: 2,
// 		children: [],
// 	},
// 	{
// 		depth: 2,
// 		id: 6,
// 		name: "bar",
// 		parentId: 4,
// 		type: 2,
// 		children: [],
// 	},
// ]

export function DevTools(props: { store: Store }) {
	return (
		<AppCtx.Provider value={props.store}>
			<div class={s.root}>
				<div class={s.components}>
					<TreeBar />
					<TreeView rootId={1} />
				</div>
				<div class={s.sidebar}>
					<Sidebar title="Hydrator" />
				</div>
			</div>
		</AppCtx.Provider>
	);
}
