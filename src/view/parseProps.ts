import { ObjPath } from "./components/ElementProps";

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
	| "symbol";

export interface PropData {
	name: string;
	type: PropDataType;
	value: any;
	path: ObjPath;
	editable: boolean;
	collapsable: boolean;
	depth: number;
}

export function flatten(
	data: any,
	path: ObjPath,
	limit: number,
	out: PropData[] = [],
): PropData[] {
	let depth = path.length > 0 ? path.length - 1 : 0;
	const name = path.length > 0 ? path[depth] + "" : "";

	if (Array.isArray(data)) {
		out.push({
			depth,
			name,
			type: "array",
			collapsable: true,
			editable: false,
			path,
			value: "Array",
		});
		data.forEach((item, i) => flatten(item, path.concat(i), limit, out));
	} else if (data instanceof Set) {
		out.push({
			depth,
			name,
			type: "set",
			collapsable: false,
			editable: false,
			path,
			value: "Set",
		});
	} else if (typeof data === "object") {
		if (data === null) {
			out.push({
				depth,
				name,
				type: "null",
				collapsable: false,
				editable: false,
				path,
				value: data,
			});
		} else {
			// Functions are encoded as objects
			if (
				Object.keys(data).length === 2 &&
				typeof data.name === "string" &&
				data.type === "function"
			) {
				out.push({
					depth,
					name,
					type: "function",
					collapsable: false,
					editable: false,
					path,
					value: data.name + "()",
				});
			} else {
				// Filter out initial object
				if (path.length > 0) {
					out.push({
						depth,
						name,
						type: "object",
						collapsable: Object.keys(data).length > 0,
						editable: false,
						path,
						value: "Object",
					});
				}

				Object.keys(data).forEach(key =>
					flatten(data[key], path.concat(key), limit, out),
				);
			}
		}
	} else {
		const type = typeof data;
		out.push({
			depth,
			name,
			type: type as any,
			collapsable: false,
			editable: type !== "undefined",
			path,
			value: data,
		});
	}

	return out;
}

/**
 * Parse a user entered value.
 */
export function parseInput(v: string) {
	v = v.trim();

	switch (v) {
		case "true":
		case "false":
			return v === "true";
		case "null":
			return null;
		case "undefined":
			return undefined;
		case "NaN":
			return NaN;
		case "Infinity":
		case "+Infinity":
			return Infinity;
		case "-Infinity":
			return -Infinity;
	}

	if (/^[-+.]?\d*(?:[.]?\d*)$/.test(v)) {
		return Number(v);
	}

	if (v.length) {
		if (v[0] === "'" || v[0] === '"') {
			return v.slice(1, v.length - 1);
		} else {
			try {
				return JSON.parse(v);
			} catch (err) {
				return v;
			}
		}
	}

	return undefined;
}
