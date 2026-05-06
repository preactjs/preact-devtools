import {
	ENCODE_CACHE_LIMIT,
	LRUCache,
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

	describe("LRUCache", () => {
		it("should return undefined for missing entries", () => {
			const cache = new LRUCache<string, number>(2);

			expect(cache.get("missing")).to.equal(undefined);
		});

		it("should store and read entries", () => {
			const cache = new LRUCache<string, number>(2);

			cache.set("a", 1);

			expect(cache.get("a")).to.equal(1);
		});

		it("should evict the oldest entry when the limit is exceeded", () => {
			const cache = new LRUCache<string, number>(2);

			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);

			expect(cache.get("a")).to.equal(undefined);
			expect(cache.get("b")).to.equal(2);
			expect(cache.get("c")).to.equal(3);
		});

		it("should refresh recency when an entry is read", () => {
			const cache = new LRUCache<string, number>(2);

			cache.set("a", 1);
			cache.set("b", 2);
			expect(cache.get("a")).to.equal(1);
			cache.set("c", 3);

			expect(cache.get("a")).to.equal(1);
			expect(cache.get("b")).to.equal(undefined);
			expect(cache.get("c")).to.equal(3);
		});

		it("should refresh recency when an existing entry is written", () => {
			const cache = new LRUCache<string, number>(2);

			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("a", 3);
			cache.set("c", 4);

			expect(cache.get("a")).to.equal(3);
			expect(cache.get("b")).to.equal(undefined);
			expect(cache.get("c")).to.equal(4);
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
