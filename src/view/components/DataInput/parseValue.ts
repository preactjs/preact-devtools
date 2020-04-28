export function parseValue(v: string) {
	v = ("" + v).trim();

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

	if (/^["]/.test(v)) {
		if (/["]$/.test(v)) return v.slice(1, v.length - 1);
		throw new TypeError("Invalid input");
	} else if (/^[-+.]?\d*(?:[.]?\d*)$/.test(v)) {
		return Number(v);
	} else if (/^\{.*\}$/.test(v) || /^\[.*\]$/.test(v)) {
		try {
			return JSON.parse(v);
		} catch (err) {
			throw new TypeError(err.message);
		}
	}

	throw new TypeError("Unknown type");
}

export function isStringifiedVNode(v: string) {
	return v.startsWith("<") && v.endsWith("/>");
}

const MAX_PREVIEW = 50;
function truncate(s: string) {
	return s.length > MAX_PREVIEW ? `${s.substr(0, MAX_PREVIEW)}…` : s;
}

export function genPreview(v: any): string {
	if (Array.isArray(v)) {
		return `[${v.map(x => genPreview(x)).join(", ")}]`;
	}
	if (v !== null && typeof v === "object") {
		if (Object.keys(v).length === 2) {
			if (v.type === "vnode") return `<${truncate(v.name)} />`;
			if (v.type === "set") return `Set<${truncate(v.name)}>`;
			if (v.type === "map") return `Map<${truncate(v.name)}>`;
			if (v.type === "function") {
				return `ƒ ${v.name === "anonymous" ? "" : truncate(v.name)}()`;
			}
			if (v.type === "blob") return "Blob {}";
		}

		const obj = Object.entries(v).map(x => {
			return `${x[0]}: ${genPreview(x[1])}`;
		});
		return `{${obj.join(", ")}}`;
	}
	if (typeof v === "string") {
		if (v === "[[Circular]]") return v;
		return `"${truncate(v)}"`;
	}
	return truncate("" + v);
}
