export function flush() {}

export interface Store {}

export type ID = number;

export enum DevNodeType {
	FunctionComponent,
	ClassComponent,
	Element,
	ForwardRef,
	Memo,
	Context,
	Consumer,
	Suspense,
}

export interface DevNode {
	id: ID;
	type: DevNodeType;
	name: string;
	parentId: ID;

	// Display properties
	depth: number;
}

export type Tree = Map<ID, DevNode>;

export interface UiState {
	selected: ID;
}

export function getAllChildren(tree: Tree, id: ID): Set<ID> {
	const out = new Set<ID>();
	let item: ID | undefined;
	let stack: ID[] = [id];
	while ((item = stack.pop())) {
		tree.forEach(node => {
			if (node.parentId === item) {
				out.add(node.id);
				stack.push(node.id);
			}
		});
	}
	return out;
}
