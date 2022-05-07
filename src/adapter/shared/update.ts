import { ObjPath } from "../renderer";

function clone(value: any) {
	if (Array.isArray(value)) return value.slice();
	if (value !== null && typeof value === "object") {
		if (value instanceof Set) return new Set(value);
		if (value instanceof Map) return new Map(value);
		return { ...value };
	}
	return value;
}

/**
 * Deeply set a property and clone all parent objects/arrays
 */
export function setInCopy<T = any>(
	obj: T,
	path: ObjPath,
	value: any,
	idx = 0,
): T {
	if (idx >= path.length) return value;

	const updated = clone(obj);
	if (obj instanceof Set) {
		const oldValue = Array.from(obj)[+path[idx]];
		updated.delete(oldValue);
		updated.add(setInCopy(oldValue, path, value, idx + 1));
	} else if (obj instanceof Map) {
		const oldEntry = Array.from(obj)[+path[idx]];
		const isKey = +path[idx + 1] === 0;
		if (isKey) {
			updated.delete(oldEntry[0]);
			updated.set(setInCopy(oldEntry[0], path, value, idx + 2), oldEntry[1]);
		} else {
			updated.delete(oldEntry[0]);
			updated.set(oldEntry[0], setInCopy(oldEntry[1], path, value, idx + 2));
		}
	} else {
		const key = path[idx];
		(updated as any)[key] = setInCopy((obj as any)[key], path, value, idx + 1);
	}
	return updated as any;
}

/**
 * Deeply mutate a property by walking down an array of property keys
 */
export function setIn(obj: Record<string, any>, path: ObjPath, value: any) {
	const last = path.pop();
	const parent = path.reduce((acc, attr) => (acc ? acc[attr] : null), obj);
	if (parent && last) {
		parent[last] = value;
	}
}

export function hasIn(obj: Record<string, any>, path: ObjPath) {
	let item = obj;
	for (let i = 0; i < path.length; i++) {
		const key = path[i];
		if (item && key in item) {
			const next = item[key];
			if (next !== null && typeof next === "object") {
				item = next;
			}
		} else {
			return false;
		}
	}

	return true;
}
