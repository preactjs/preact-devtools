export type PropDataType =
	| "boolean"
	| "string"
	| "number"
	| "array"
	| "map"
	| "set"
	| "object"
	| "null"
	| "undefined"
	| "function"
	| "bigint"
	| "vnode"
	| "blob"
	| "symbol";

export interface PropData {
	id: string;
	type: PropDataType;
	value: any;
	editable: boolean;
	depth: number;
	children: string[];
}

export function parseProps(
	data: any,
	path: string,
	limit: number,
	out: Map<string, PropData>,
): Map<string, PropData> {
	const depth = (path.match(/\./g) || []).length;

	if (depth >= limit) {
		return out;
	}

	if (Array.isArray(data)) {
		const children: string[] = [];
		out.set(path, {
			depth,
			id: path,
			type: "array",
			editable: false,
			value: data,
			children,
		});
		data.forEach((item, i) => {
			const childPath = `${path}.${i}`;
			children.push(childPath);
			parseProps(item, childPath, limit, out);
		});
	} else if (data instanceof Set) {
		// TODO: We're dealing with serialized data here, not a Set object
		out.set(path, {
			depth,
			id: path,
			type: "set",
			editable: false,
			value: "Set",
			children: [],
		});
	} else if (typeof data === "object") {
		if (data === null) {
			out.set(path, {
				depth,
				id: path,
				type: "null",
				editable: false,
				value: data,
				children: [],
			});
		} else {
			const maybeCustom = Object.keys(data).length === 2;
			// Functions are encoded as objects
			if (
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "function"
			) {
				out.set(path, {
					depth,
					id: path,
					type: "function",
					editable: false,
					value: data,
					children: [],
				});
			} else if (
				// Same for vnodes
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "vnode"
			) {
				out.set(path, {
					depth,
					id: path,
					type: "vnode",
					editable: false,
					value: data,
					children: [],
				});
			} else if (
				// Same for Set
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "set"
			) {
				out.set(path, {
					depth,
					id: path,
					type: "set",
					editable: false,
					value: data,
					children: [],
				});
			} else if (
				// Same for Map
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "map"
			) {
				out.set(path, {
					depth,
					id: path,
					type: "map",
					editable: false,
					value: data,
					children: [],
				});
			} else if (
				// Same for Blobs
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "blob"
			) {
				out.set(path, {
					depth,
					id: path,
					type: "blob",
					editable: false,
					value: data,
					children: [],
				});
			} else {
				const node: PropData = {
					depth,
					id: path,
					type: "object",
					editable: false,
					value: data,
					children: [],
				};
				out.set(path, node);

				Object.keys(data).forEach(key => {
					const nextPath = `${path}.${key}`;
					node.children.push(nextPath);
					parseProps(data[key], nextPath, limit, out);
				});

				out.set(path, node);
			}
		}
	} else {
		const type = typeof data;
		out.set(path, {
			depth,
			id: path,
			type: type as any,
			editable: type !== "undefined" && data !== "[[Circular]]",
			value: data,
			children: [],
		});
	}

	return out;
}
