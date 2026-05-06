export type StringTable = Map<string, number>;

/**
 * The string table holds a mapping of strings to ids. This saves a lot of space
 * in messaging because we can only need to declare a string once and can later
 * refer to its id. This is especially true for component or element names which
 * expectedoccur multiple times.
 */

/**
 * Convert a string to an id. Works similar to a gzip dictionary.
 */
export function getStringId(table: StringTable, input: string): number {
	if (input === null) return 0;

	if (!table.has(input)) {
		table.set("" + input, table.size + 1);
	}

	return table.get(input)!;
}

export const ENCODE_CACHE_LIMIT = 1000;

export class LRUCache<K, V> {
	private cache = new Map<K, V>();

	constructor(private limit: number) {}

	get(key: K): V | undefined {
		const value = this.cache.get(key);
		if (value === undefined) return undefined;

		this.cache.delete(key);
		this.cache.set(key, value);
		return value;
	}

	set(key: K, value: V) {
		if (this.cache.has(key)) {
			this.cache.delete(key);
		}

		this.cache.set(key, value);

		if (this.cache.size > this.limit) {
			const oldest = this.cache.keys().next().value;
			if (oldest !== undefined) {
				this.cache.delete(oldest);
			}
		}
	}
}

const encoded = new LRUCache<string, number[]>(ENCODE_CACHE_LIMIT);

/**
 * Convert a string to an array of codepoints
 */
export function encode(input: string): number[] {
	const cached = encoded.get(input);
	if (cached !== undefined) {
		return cached;
	}

	const value = new Array<number>(input.length);
	for (let i = 0; i < input.length; i++) {
		value[i] = input.charCodeAt(i);
	}
	encoded.set(input, value);
	return value;
}

/**
 * Convert string table to something the extension understands
 * @param {import('./devtools').AdapterState["stringTable"]} table
 * @returns {number[]}
 */
export function flushTable(table: StringTable) {
	const ops = [0];

	table.forEach((_, k) => {
		ops[0] += k.length + 1;
		ops.push(k.length, ...encode(k));
	});

	return ops;
}

/**
 * Parse message to strings
 */
export function parseTable(data: number[]) {
	const len = data[0];
	const strings = [];
	if (len > 0) {
		for (let i = 1; i < len; i++) {
			const strLen = data[i];
			let start = i + 1;
			const end = i + strLen + 1;
			let str = "";
			for (; start < end; start++) {
				str += String.fromCodePoint(data[start]);
			}
			strings.push(str);
			i += strLen;
		}
	}

	return strings;
}
