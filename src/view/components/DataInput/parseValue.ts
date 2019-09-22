import * as json5 from "json5";

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
	if (typeof v === "string") return `"${v}"`;
	return "" + v;
}
