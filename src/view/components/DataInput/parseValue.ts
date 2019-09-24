import json5 from "json5";

export function parseValue(v: string) {
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
		case "undefined":
			return "" + v;
	}

	if (v === null) return "" + v;

	return json5.stringify(v);
}

export function isStringifiedVNode(v: string) {
	return v.startsWith("<") && v.endsWith("/>");
}
