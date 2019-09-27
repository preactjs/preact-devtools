import { createStore, DevNode, ID, DevNodeType } from "../view/store";
import { valoo } from "../view/valoo";

export const treeStore = () => {
	const store = createStore();

	store.rootToChild.$.set(1, 1);
	let i = 0;
	const addNode = (parent: ID) => {
		const node: DevNode = {
			id: ++i,
			children: [],
			depth: 1,
			duration: valoo(0),
			key: "",
			name: "Foo" + i,
			parent,
			type: DevNodeType.ClassComponent,
		};

		if (store.nodes.$.has(parent)) {
			const p = store.nodes.$.get(parent)!;
			node.depth = p.depth + 1;
			p.children.push(node.id);
		}

		store.nodes.update(s => {
			s.set(node.id, node);
		});
	};

	addNode(0);
	addNode(1);
	addNode(2);
	addNode(3);
	addNode(3);
	addNode(2);
	addNode(6);
	addNode(7);
	addNode(2);
	addNode(1);

	return store;
};
