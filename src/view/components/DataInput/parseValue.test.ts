import { expect } from "chai";
import { parseValue, valueToHuman, genPreview } from "./parseValue";

describe("parseValue", () => {
	it("should parse booleans", () => {
		expect(parseValue("true")).to.equal(true);
		expect(parseValue("false")).to.equal(false);
	});

	it("should parse null/undefined", () => {
		expect(parseValue("null")).to.equal(null);
		expect(parseValue("undefined")).to.equal(undefined);
	});

	it("should treat empty as undefined", () => {
		expect(parseValue("")).to.equal(undefined);
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

describe("valueToHuman", () => {
	it("should add suffix/prefix to strings", () => {
		expect(valueToHuman("foo")).to.equal('"foo"');
		expect(valueToHuman('"foo"')).to.equal('"foo"');
	});

	it("should work with primitives", () => {
		expect(valueToHuman(true)).to.equal("true");
		expect(valueToHuman(false)).to.equal("false");
		expect(valueToHuman(-12)).to.equal("-12");
		expect(valueToHuman(-0.3)).to.equal("-0.3");
		expect(valueToHuman(null)).to.equal("null");
		expect(valueToHuman(undefined)).to.equal("");
	});

	it("should stringify objects", () => {
		expect(valueToHuman({ a: 1, b: 2 })).to.equal("{a:1,b:2}");
	});

	it("should stringify arrays", () => {
		expect(valueToHuman([1, 2, 3])).to.equal("[1,2,3]");
	});

	it("should parse stringified vnodes", () => {
		expect(valueToHuman("<span />")).to.equal("<span />");
	});

	it("should parse objects to vnodes", () => {
		expect(valueToHuman({ type: "vnode", name: "Foo" })).to.equal("<Foo />");
	});

	it("should parse objects to functions", () => {
		expect(valueToHuman({ type: "function", name: "foobar" })).to.equal(
			"foobar()",
		);
	});

	it("should parse unrelated objects", () => {
		expect(valueToHuman({ type: "foo", name: "bob" })).to.equal(
			"{type:'foo',name:'bob'}",
		);
	});
});

describe("genPreview", () => {
	it("should format values", () => {
		expect(genPreview(undefined)).to.equal("");
		expect(genPreview(null)).to.equal("null");
		expect(genPreview(-100)).to.equal("-100");
		expect(genPreview(0)).to.equal("0");
		expect(genPreview(-0)).to.equal("0");
		expect(genPreview(10000)).to.equal("10000");
		expect(genPreview("foo")).to.equal('"foo"');
		expect(genPreview([1, 2, { a: 3 }])).to.equal("[1, 2, {a: 3}]");
		expect(genPreview({ a: 123, b: [1, 2] })).to.equal("{a: 123, b: [1, 2]}");
	});
});
