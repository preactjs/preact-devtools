import type {
	InspectionSnapshot,
	InspectOptions,
	SnapshotValue,
} from "./types";

export function limit(
	value: number | undefined,
	fallback: number,
	max: number,
	name: string,
	min = 0,
) {
	if (value === undefined) return fallback;
	if (!Number.isInteger(value) || value < min || value > max) {
		throw new RangeError(
			`${name} must be an integer between ${min} and ${max}`,
		);
	}
	return value;
}

/** Read a framework-owned field without evaluating an application accessor. */
export function readOwnData(value: object | null, key: string): unknown {
	if (value === null) return null;
	try {
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		return descriptor
			? "value" in descriptor
				? descriptor.value
				: "[Getter]"
			: null;
	} catch {
		return "[Uninspectable]";
	}
}

export function byteLength(value: unknown) {
	return new TextEncoder().encode(JSON.stringify(value)).length;
}

/** Bounded, descriptor-only serialization. Never evaluates accessor properties. */
export function snapshotValue(
	input: unknown,
	options: InspectOptions = {},
): InspectionSnapshot {
	const maxDepth = limit(options.maxDepth, 3, 20, "maxDepth");
	const maxEntries = limit(options.maxEntries, 100, 10000, "maxEntries");
	const maxStringLength = limit(
		options.maxStringLength,
		1000,
		10000,
		"maxStringLength",
		1,
	);
	const maxBytes = limit(options.maxBytes, 65536, 1048576, "maxBytes", 128);
	const seen = new Set<object>();
	let entries = 0;
	let truncated = false;

	function unavailable(reason: string) {
		truncated = true;
		return `[${reason}]`;
	}

	function visit(value: unknown, depth: number): SnapshotValue {
		switch (typeof value) {
			case "undefined":
				return "[Undefined]";
			case "function":
				return "[Function]";
			case "symbol":
			case "bigint":
				return visit(String(value), depth);
			case "string":
				if (value.length <= maxStringLength) return value;
				truncated = true;
				return value.slice(0, maxStringLength - 1) + "…";
			case "number":
				return Number.isFinite(value) ? value : String(value);
			case "boolean":
				return value;
		}
		if (value === null || typeof value !== "object") return null;
		if (depth >= maxDepth) return unavailable("MaxDepth");
		if (seen.has(value)) return unavailable("Circular");
		seen.add(value);

		try {
			const array = Array.isArray(value);
			const prototype = Object.getPrototypeOf(value);
			if (!array && prototype !== Object.prototype && prototype !== null) {
				return unavailable("Instance");
			}
			const out: SnapshotValue[] | Record<string, SnapshotValue> = array
				? []
				: Object.create(null);

			function property(key: string) {
				const descriptor = Object.getOwnPropertyDescriptor(value, key);
				if (!descriptor) return;
				entries++;
				(out as Record<string, SnapshotValue>)[key] =
					"value" in descriptor
						? visit(descriptor.value, depth + 1)
						: "[Getter]";
			}

			if (array) {
				for (let i = 0; i < value.length; i++) {
					if (entries >= maxEntries) {
						truncated = true;
						break;
					}
					// Preserve holes without reading through Array.prototype.
					if (Object.prototype.hasOwnProperty.call(value, i))
						property(String(i));
					else {
						entries++;
						(out as SnapshotValue[]).push("[Empty]");
					}
				}
			} else {
				for (const key in value) {
					if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
					if (key === "__source" || key === "__self") continue;
					if (entries >= maxEntries || key.length > maxStringLength) {
						truncated = true;
						break;
					}
					property(key);
				}
			}
			return out;
		} catch {
			return unavailable("Uninspectable");
		} finally {
			seen.delete(value);
		}
	}

	const value = visit(input, 0);
	const result = { value, truncated };
	return byteLength(result) <= maxBytes
		? result
		: { value: "[MaxBytes]", truncated: true };
}
