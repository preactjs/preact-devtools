import * as json5 from "json5-es";

export function parseValue(v: string) {
	v = v.trim();

	switch (v) {
		case "true":
		case "false":
			return v === "true";
		case "null":
			return null;
		case "":
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

	if (/^['"]/.test(v)) {
		if (/['"]$/.test(v)) return v.slice(1, v.length - 1);
		throw new TypeError("Invalid input");
	} else if (/^[-+.]?\d*(?:[.]?\d*)$/.test(v)) {
		return Number(v);
	}

	try {
		return json5.parse(v);
	} catch (err) {
		throw new TypeError(err.message);
	}
}

export function valueToHuman(v: any): string {
	switch (typeof v) {
		case "string":
			if (isStringifiedVNode(v) || v.endsWith("()")) {
				return v;
			}
			return v[0] !== '"' || v[v.length - 1] !== '"' ? `"${v}"` : v;
		case "number":
		case "boolean":
			return "" + v;
		case "undefined":
			return "";
	}

	if (v === null) return "" + v;

	if (Object.keys(v).length === 2) {
		if (typeof v.name === "string") {
			if (v.type === "vnode") {
				return `<${v.name} />`;
			} else if (v.type === "function") {
				return `${v.name}()`;
			}
		}
	}

	return json5.stringify(v);
}

export function isStringifiedVNode(v: string) {
	return v.startsWith("<") && v.endsWith("/>");
}

export function displayCollection(v: any): string {
	if (Array.isArray(v)) return "Array";
	if (v !== null && typeof v === "object") {
		if (Object.keys(v).length === 2) {
			if (v.type === "vnode") return `<${v.name} />`;
			if (v.type === "set") return `Set<${v.name}>`;
			if (v.type === "map") return `Map<${v.name}>`;
			if (v.type === "function") return v.name + "()";
		}
		return "Object";
	}
	if (typeof v === "string") return `"${v}"`;
	return "" + (v === undefined ? "" : v);
}
