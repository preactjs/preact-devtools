export interface JSONVNode {
	type: "vnode";
	name: string;
}

export interface JSONFunction {
	type: "function";
	name: string;
}

export interface JSONSet {
	type: "set";
}

export type JSONValue =
	| string
	| boolean
	| number
	| null
	| undefined
	| JSONVNode
	| JSONFunction
	| Record<string, any>;

export function serializeProps(value: JSONValue): any {
	if (Array.isArray(value)) {
		return value.map(serializeProps);
	} else if (
		value !== null &&
		typeof value === "object" &&
		Object.keys(value).length === 2
	) {
		if (typeof value.name === "string") {
			if (value.type === "function") {
				return value.name + "()";
			} else if (value.type === "vnode") {
				return `<${value.name} />`;
			}
		}
	}
	return value;
}
