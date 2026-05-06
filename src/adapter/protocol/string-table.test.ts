import {
	ENCODE_CACHE_LIMIT,
	encode,
	parseTable,
	flushTable,
} from "./string-table";
import { expect } from "chai";

describe("StringTable", () => {
	describe("flushTable", () => {
		it("should flush", () => {
			const table = new Map([
				["abc", 1],
				["foo", 2],
			]);
			expect(flushTable(table)).to.deep.equal([
				8, 3, 97, 98, 99, 3, 102, 111, 111,
			]);
		});
	});

	describe("parseTable", () => {
		it("should parse single string", () => {
			const data = [4, 3, 97, 98, 99];
			expect(parseTable(data)).to.deep.equal(["abc"]);
		});

		it("should parse multiple strings", () => {
			const data = [8, 3, 97, 98, 99, 3, 102, 111, 111];
			expect(parseTable(data)).to.deep.equal(["abc", "foo"]);
		});
	});

	describe("encode", () => {
		it("should preserve NUL characters", () => {
			expect(parseTable([2, 1, ...encode("\0")])).to.deep.equal(["\0"]);
		});

		it("should reuse cached strings", () => {
			const encoded = encode("cached-string");
			expect(encode("cached-string")).to.equal(encoded);
		});

		it("should evict the least recently used string", () => {
			const prefix = "evict-lru";
			const encoded = encode(prefix);

			for (let i = 0; i < ENCODE_CACHE_LIMIT; i++) {
				encode(`${prefix}-${i}`);
			}

			expect(encode(prefix)).to.not.equal(encoded);
		});

		it("should refresh a string when it is read from the cache", () => {
			const prefix = "refresh-lru";
			const encoded = encode(prefix);

			for (let i = 0; i < ENCODE_CACHE_LIMIT - 1; i++) {
				encode(`${prefix}-${i}`);
			}

			expect(encode(prefix)).to.equal(encoded);
			encode(`${prefix}-overflow`);

			expect(encode(prefix)).to.equal(encoded);
		});
	});
});
