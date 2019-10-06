import { expect } from "chai";
import { parseProps } from "./parseProps";

const serialize = (v: Map<any, any>) => Array.from(v.values());

describe("flatten", () => {
	it("should flatten strings", () => {
		const tree = new Map();
		parseProps("foo", ["foo"], 2, tree);

		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: true,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "string",
				value: "foo",
				children: [],
			},
		]);
	});

	it("should flatten numbers", () => {
		const tree = new Map();
		parseProps(12, ["foo"], 2, tree);

		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: true,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "number",
				value: 12,
				children: [],
			},
		]);
	});

	it("should flatten booleans", () => {
		const tree = new Map();
		parseProps(false, ["foo"], 2, tree);

		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: true,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "boolean",
				value: false,
				children: [],
			},
		]);
	});

	it("should flatten null", () => {
		const tree = new Map();
		parseProps(null, ["foo"], 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "null",
				value: null,
				children: [],
			},
		]);
	});

	it("should flatten undefined", () => {
		const tree = new Map();
		parseProps(undefined, ["foo"], 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "undefined",
				value: undefined,
				children: [],
			},
		]);
	});

	it("should parse functions", () => {
		const tree = new Map();
		const fn = {
			type: "function",
			name: "fooBar",
		};
		parseProps(fn, ["foo"], 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "function",
				value: fn,
				children: [],
			},
		]);
	});

	it("should flatten arrays", () => {
		const tree = new Map();
		parseProps([1, 2], ["foo"], 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: true,
				editable: false,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "array",
				value: [1, 2],
				children: ["foo.0", "foo.1"],
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				id: "foo.0",
				path: ["foo", 0],
				type: "number",
				value: 1,
				children: [],
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				id: "foo.1",
				path: ["foo", 1],
				type: "number",
				value: 2,
				children: [],
			},
		]);
	});

	it("should flatten objects", () => {
		const tree = new Map();
		parseProps({ foo: 123, bar: "abc" }, [""], 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: true,
				editable: false,
				depth: 0,
				id: "",
				path: [""],
				type: "object",
				value: {
					foo: 123,
					bar: "abc",
				},
				children: [".foo", ".bar"],
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				id: ".foo",
				path: ["", "foo"],
				type: "number",
				value: 123,
				children: [],
			},
			{
				collapsable: false,
				editable: true,
				depth: 1,
				id: ".bar",
				path: ["", "bar"],
				type: "string",
				value: "abc",
				children: [],
			},
		]);
	});

	it("should flatten nested objects", () => {
		const tree = new Map();
		parseProps({ foo: { bar: "abc" } }, ["foo"], 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: true,
				editable: false,
				depth: 0,
				id: "foo",
				path: ["foo"],
				type: "object",
				value: {
					foo: {
						bar: "abc",
					},
				},
				children: ["foo.foo"],
			},
			{
				collapsable: true,
				editable: false,
				depth: 1,
				id: "foo.foo",
				path: ["foo", "foo"],
				type: "object",
				value: {
					bar: "abc",
				},
				children: ["foo.foo.bar"],
			},
			{
				collapsable: false,
				editable: true,
				depth: 2,
				id: "foo.foo.bar",
				path: ["foo", "foo", "bar"],
				type: "string",
				value: "abc",
				children: [],
			},
		]);
	});

	it("should flatten set", () => {
		const tree = new Map();
		parseProps(new Set([1, 2, 3]), [], 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: false,
				depth: 0,
				id: "",
				path: [],
				type: "set",
				value: "Set",
				children: [],
			},
		]);
	});
});
