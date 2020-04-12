import { createStore } from "../view/store";
import { InspectData } from "../adapter/adapter/adapter";
import { DevNodeType, DevNode, ID } from "../view/store/types";

export const inspect: InspectData = {
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

	let i = 0;
	const addNode = (parent: ID) => {
		const node: DevNode = {
			id: ++i,
			children: [],
			depth: 1,
			key: "",
			name: "Foo" + i,
			parent,
			type: DevNodeType.ClassComponent,
			startTime: 0,
			endTime: 0,
			treeStartTime: 0,
			treeEndTime: 0,
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

	store.nodes.$.get(3)!.key = "foobar";

	store.subscribe(() => {
		store.inspectData.$ = inspect;
	});

	store.inspectData.$ = inspect;
	return store;
};
