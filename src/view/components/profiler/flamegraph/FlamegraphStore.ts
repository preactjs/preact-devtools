import { ID } from "../../../store/types";

export function getRoot<T extends { id: ID; parent: ID }, U extends Map<ID, T>>(
	tree: U,
	id: ID,
) {
	let item = tree.get(id);
	let last = id;
	while (item !== undefined) {
		last = item.id;
		item = tree.get(item.parent);
	}

	return last;
}
