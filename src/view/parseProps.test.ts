import { expect } from "chai";
import { flatten, parseInput } from "./parseProps";

describe("flatten", () => {
	it("should flatten strings", () => {
		expect(flatten("foo", ["foo"], 2)).to.deep.equal([
			{
				collapsable: false,
				editable: true,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "string",
				value: "foo",
			},
		]);
	});

	it("should flatten numbers", () => {
		expect(flatten(12, ["foo"], 2)).to.deep.equal([
			{
				collapsable: false,
				editable: true,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "number",
				value: 12,
			},
		]);
	});

	it("should flatten booleans", () => {
		expect(flatten(false, ["foo"], 2)).to.deep.equal([
			{
				collapsable: false,
				editable: true,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "boolean",
				value: false,
			},
		]);
	});

	it("should flatten null", () => {
		expect(flatten(null, ["foo"], 2)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "null",
				value: null,
			},
		]);
	});

	it("should flatten undefined", () => {
		expect(flatten(undefined, ["foo"], 2)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "undefined",
				value: undefined,
			},
		]);
	});

	it("should parse functions", () => {
		const fn = {
			type: "function",
			name: "fooBar",
		};
		expect(flatten(fn, ["foo"], 2)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "function",
				value: "fooBar()",
			},
		]);
	});

	it("should flatten arrays", () => {
		expect(flatten([1, 2], ["foo"], 2)).to.deep.equal([
			{
				collapsable: true,
				editable: false,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "array",
				value: "Array",
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				name: "0",
				path: ["foo", 0],
				type: "number",
				value: 1,
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				name: "1",
				path: ["foo", 1],
				type: "number",
				value: 2,
			},
		]);
	});

	it("should flatten objects", () => {
		expect(flatten({ foo: 123, bar: "abc" }, [""], 2)).to.deep.equal([
			{
				collapsable: true,
				editable: false,
				depth: 0,
				name: "",
				path: [""],
				type: "object",
				value: "Object",
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				name: "foo",
				path: ["", "foo"],
				type: "number",
				value: 123,
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				name: "bar",
				path: ["", "bar"],
				type: "string",
				value: "abc",
			},
		]);
	});

	it("should flatten nested objects", () => {
		expect(flatten({ foo: { bar: "abc" } }, ["foo"], 2)).to.deep.equal([
			{
				collapsable: true,
				editable: false,
				depth: 0,
				name: "foo",
				path: ["foo"],
				type: "object",
				value: "Object",
			},
			{
				collapsable: true,
				editable: false,
				depth: 1,
				name: "foo",
				path: ["foo", "foo"],
				type: "object",
				value: "Object",
			},
			{
				collapsable: false,
				editable: true,
				depth: 2,
				name: "bar",
				path: ["foo", "foo", "bar"],
				type: "string",
				value: "abc",
			},
		]);
	});

	it("should flatten set", () => {
		expect(flatten(new Set([1, 2, 3]), [], 2)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				name: "",
				path: [],
				type: "set",
				value: "Set",
			},
		]);
	});
});

describe("parseInput", () => {
	it("should parse booleans", () => {
		expect(parseInput("true")).to.equal(true);
		expect(parseInput("false")).to.equal(false);
	});

	it("should parse null/undefined", () => {
		expect(parseInput("null")).to.equal(null);
		expect(parseInput("undefined")).to.equal(undefined);
	});

	it("should parse numbers", () => {
		expect(parseInput("123")).to.equal(123);
		expect(parseInput("-123")).to.equal(-123);
		expect(parseInput("+123")).to.equal(123);
		expect(parseInput("-123.23")).to.equal(-123.23);
		expect(parseInput("+123.23")).to.equal(123.23);
		expect(parseInput(".1")).to.equal(0.1);
		expect(parseInput("+.1")).to.equal(0.1);
		expect(parseInput("123.23")).to.equal(123.23);
		expect(parseInput("Infinity")).to.equal(Infinity);
		expect(parseInput("+Infinity")).to.equal(Infinity);
		expect(parseInput("-Infinity")).to.equal(-Infinity);
		expect(isNaN(parseInput("NaN") as any)).to.equal(true);
	});

	it("should parse strings", () => {
		expect(parseInput("'abc'")).to.equal("abc");
		expect(parseInput('"abc"')).to.equal("abc");
		expect(parseInput('"123"')).to.equal("123");
		expect(parseInput("''")).to.equal("");
	});

	it("should parse arrays", () => {
		expect(parseInput("[1,2,3]")).to.deep.equal([1, 2, 3]);
	});

	it.skip("should parse objects", () => {
		expect(parseInput("{a:1,b:2,c:3}")).to.deep.equal({ a: 1, b: 2, c: 3 });
	});

	it("should not throw on invalid data", () => {
		expect(parseInput("[1,2,3")).to.equal("[1,2,3");
	});
});
