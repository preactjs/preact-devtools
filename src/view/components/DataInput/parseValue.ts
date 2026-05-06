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
	} else if (/^-?\d+n$/.test(v)) {
		return {
			type: "bigint",
			value: v.slice(0, -1),
		};
	} else if (/^\{.*\}$/.test(v) || /^\[.*\]$/.test(v)) {
		try {
			return JSON.parse(v);
		} catch (err: any) {
			throw new TypeError(err.message);
		}
	}

	throw new TypeError("Unknown type");
}

export function isStringifiedVNode(v: string) {
	return v.startsWith("<") && v.endsWith("/>");
}

const MAX_PREVIEW = 50;
const MAX_PREVIEW_ITEMS = 10;
function truncate(s: string) {
	return s.length > MAX_PREVIEW ? `${s.substr(0, MAX_PREVIEW)}…` : s;
}

function previewItems(items: any[], total = items.length) {
	const visible = items.slice(0, MAX_PREVIEW_ITEMS).map(x => genPreview(x));
	if (total > MAX_PREVIEW_ITEMS) {
		visible.push(`… ${total - MAX_PREVIEW_ITEMS} more`);
	}
	return visible.join(", ");
}

export function genPreview(v: any): string {
	if (v !== null && typeof v === "object") {
		if (v.type === "set") {
			return `Set(${v.entries.length}) ${truncate(
				`[${previewItems(v.entries)}]`,
			)}`;
		} else if (v.type === "map") {
			return `Map(${v.entries.length}) ${truncate(
				`[${previewItems(v.entries)}]`,
			)}`;
		} else if (v.type === "signal") {
			return `ƒ ${v.name} (${truncate(genPreview(v.value))})`;
		}

		if (Array.isArray(v)) {
			return `[${previewItems(v)}]`;
		}
		if (Object.keys(v).length === 2) {
			if (v.type === "vnode") return `<${truncate(v.name)} />`;
			if (v.type === "function") {
				return `ƒ ${v.name === "anonymous" ? "" : truncate(v.name)}()`;
			}
			if (v.type === "blob") return "Blob {}";
			if (v.type === "symbol") return v.name;
			if (v.type === "html") return v.name;
			if (v.type === "bigint") return `${v.value}n`;
		}

		const entries = Object.entries(v);
		const obj = entries.slice(0, MAX_PREVIEW_ITEMS).map(x => {
			return `${x[0]}: ${genPreview(x[1])}`;
		});
		if (entries.length > MAX_PREVIEW_ITEMS) {
			obj.push(`… ${entries.length - MAX_PREVIEW_ITEMS} more`);
		}
		return `{${obj.join(", ")}}`;
	}
	if (typeof v === "string") {
		if (v === "__preact_empty__") return "";
		if (v === "[[Circular]]") return v;
		return `"${truncate(v)}"`;
	}
	return truncate("" + v);
}
