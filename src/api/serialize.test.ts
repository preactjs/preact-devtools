import { snapshotValue, byteLength } from "./serialize";

describe("snapshotValue", () => {
	it("copies JSON values without retaining references", () => {
		const source = { a: [1, true, null], nested: { value: "ok" } };
		const result = snapshotValue(source);
		expect(result).toEqual({ value: source, truncated: false });
		(source.a as any[]).push(2);
		expect((result.value as any).a).toHaveLength(3);
	});

	it("does not invoke getters or toJSON", () => {
		const getter = vi.fn(() => {
			throw new Error("should not run");
		});
		const toJSON = vi.fn();
		const source = {
			get secret() {
				return getter();
			},
			toJSON,
		};
		expect(snapshotValue(source)).toEqual({
			value: { secret: "[Getter]", toJSON: "[Function]" },
			truncated: false,
		});
		expect(getter).not.toHaveBeenCalled();
		expect(toJSON).not.toHaveBeenCalled();
	});

	it("bounds depth, total entries and string lengths", () => {
		expect(snapshotValue({ a: { b: 1 } }, { maxDepth: 1 })).toEqual({
			value: { a: "[MaxDepth]" },
			truncated: true,
		});
		expect(snapshotValue({ a: [1, 2, 3], b: 4 }, { maxEntries: 3 })).toEqual({
			value: { a: [1, 2] },
			truncated: true,
		});
		expect(snapshotValue("12345", { maxStringLength: 3 })).toEqual({
			value: "12…",
			truncated: true,
		});
	});

	it("bounds UTF-8 response size", () => {
		const result = snapshotValue(["🐳".repeat(100)], { maxBytes: 128 });
		expect(result).toEqual({ value: "[MaxBytes]", truncated: true });
		expect(byteLength(result)).toBeLessThanOrEqual(128);
	});

	it("handles cycles, sparse arrays, bigint, symbols, and class instances", () => {
		const cycle: any = {};
		cycle.self = cycle;
		expect(snapshotValue(cycle)).toEqual({
			value: { self: "[Circular]" },
			truncated: true,
		});
		const values = new Array(1).concat([1n, Symbol("key"), new Date()]);
		expect(snapshotValue(values)).toEqual({
			value: ["[Empty]", "1", "Symbol(key)", "[Instance]"],
			truncated: true,
		});
	});

	it("handles throwing reflection and prototype-sensitive keys", () => {
		const proxy = new Proxy(
			{},
			{
				ownKeys() {
					throw new Error("no");
				},
			},
		);
		expect(snapshotValue(proxy)).toEqual({
			value: "[Uninspectable]",
			truncated: true,
		});
		const source = JSON.parse(
			'{"__proto__":{"polluted":true},"constructor":1}',
		);
		expect(JSON.parse(JSON.stringify(snapshotValue(source).value))).toEqual(
			source,
		);
		expect(({} as any).polluted).toBeUndefined();
	});

	it.each([
		{ maxDepth: -1 },
		{ maxDepth: Infinity },
		{ maxDepth: 21 },
		{ maxEntries: NaN },
		{ maxEntries: 1.5 },
		{ maxEntries: 10001 },
		{ maxStringLength: 0 },
		{ maxBytes: 127 },
		{ maxBytes: 1048577 },
	])("rejects invalid limits: %j", options => {
		expect(() => snapshotValue({}, options)).toThrow(RangeError);
	});
});
