import { createStore, DevNode, ID, DevNodeType } from "../view/store";
import { valoo } from "../view/valoo";
import { InspectData } from "../adapter/adapter";

const inspect: InspectData = {
	canEditHooks: false,
	canEditProps: true,
	canEditState: false,
	context: null,
	hooks: null,
	id: 2,
	name: "foo",
	state: null,
	type: "",
	props: {
		foo: "bar",
		longvalue: "asdji asdj asijd lksaj dlask kajdaklsj dklsabar",
		bob: null,
		bazly: 123,
		baz: true,
		arr: [1, 2, 3],
		obj: { foo: "bar" },
		set: {
			type: "set",
			name: "[]",
		},
		map: {
			type: "map",
			name: "[]",
		},
		children: {
			type: "vnode",
			name: "span",
		},
		bar: {
			type: "function",
			name: "foobar",
		},
	},
};

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

	store.selection.selected.$ = 2;

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
	addNode(6);
	addNode(7);
	addNode(2);
	addNode(1);
	addNode(6);
	addNode(7);
	addNode(2);
	addNode(1);

	store.subscribe(name => {
		if (name === "inspect") {
			console.log("event inspect");
		}
	});

	return store;
};
