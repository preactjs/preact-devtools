import { expect } from "chai";
import { parseValue } from "./parseValue";

describe("parseValue", () => {
	it("should parse booleans", () => {
		expect(parseValue("true")).to.equal(true);
		expect(parseValue("false")).to.equal(false);
	});

	it("should parse null/undefined", () => {
		expect(parseValue("null")).to.equal(null);
		expect(parseValue("undefined")).to.equal(undefined);
	});

	it("should parse numbers", () => {
		expect(parseValue("123")).to.equal(123);
		expect(parseValue("-123")).to.equal(-123);
		expect(parseValue("+123")).to.equal(123);
		expect(parseValue("-123.23")).to.equal(-123.23);
		expect(parseValue("+123.23")).to.equal(123.23);
		expect(parseValue(".1")).to.equal(0.1);
		expect(parseValue("+.1")).to.equal(0.1);
		expect(parseValue("123.23")).to.equal(123.23);
		expect(parseValue("Infinity")).to.equal(Infinity);
		expect(parseValue("+Infinity")).to.equal(Infinity);
		expect(parseValue("-Infinity")).to.equal(-Infinity);
		expect(isNaN(parseValue("NaN") as any)).to.equal(true);
	});

	it("should parse strings", () => {
		expect(parseValue("'abc'")).to.equal("abc");
		expect(parseValue('"abc"')).to.equal("abc");
		expect(parseValue('"123"')).to.equal("123");
		expect(parseValue("''")).to.equal("");
	});

	it("should parse arrays", () => {
		expect(parseValue("[1,2,3]")).to.deep.equal([1, 2, 3]);
	});

	it("should parse objects", () => {
		expect(parseValue("{a:1,b:2,c:3}")).to.deep.equal({ a: 1, b: 2, c: 3 });
	});

	it("should throw on invalid data", () => {
		expect(() => parseValue("[1,2,3")).to.throw();
	});
});
