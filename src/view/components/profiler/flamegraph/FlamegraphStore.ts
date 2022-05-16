import { ID } from "../../../store/types";

export function getRoot<T extends { id: ID; parent: ID }, U extends Map<ID, T>>(
	tree: U,
	id: ID,
) {
	let pId = id;
	let last = id;
	while (pId !== -1) {
		const item = tree.get(pId)!;
		last = pId;
		pId = item.parent;
	}

	return last;
}
