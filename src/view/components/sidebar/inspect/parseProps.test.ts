import { expect } from "chai";
import { parseProps } from "./parseProps";

const serialize = (v: Map<any, any>) => Array.from(v.values());

describe("parseProps", () => {
	it("should flatten strings", () => {
		const tree = new Map();
		parseProps("foo", "foo", 2, tree);

		expect(serialize(tree)).to.deep.equal([
			{
				editable: true,
				depth: 0,
				id: "foo",
				type: "string",
				value: "foo",
				children: [],
				meta: null,
			},
		]);
	});

	it("should flatten numbers", () => {
		const tree = new Map();
		parseProps(12, "foo", 2, tree);

		expect(serialize(tree)).to.deep.equal([
			{
				editable: true,
				depth: 0,
				id: "foo",
				type: "number",
				value: 12,
				children: [],
				meta: null,
			},
		]);
	});

	it("should flatten booleans", () => {
		const tree = new Map();
		parseProps(false, "foo", 2, tree);

		expect(serialize(tree)).to.deep.equal([
			{
				editable: true,
				depth: 0,
				id: "foo",
				type: "boolean",
				value: false,
				children: [],
				meta: null,
			},
		]);
	});

	it("should flatten null", () => {
		const tree = new Map();
		parseProps(null, "foo", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "foo",
				type: "null",
				value: null,
				children: [],
				meta: null,
			},
		]);
	});

	it("should flatten undefined", () => {
		const tree = new Map();
		parseProps(undefined, "foo", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "foo",
				type: "undefined",
				value: undefined,
				children: [],
				meta: null,
			},
		]);
	});

	it("should parse functions", () => {
		const tree = new Map();
		const fn = {
			type: "function",
			name: "fooBar",
		};
		parseProps(fn, "foo", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "foo",
				type: "function",
				value: fn,
				children: [],
				meta: null,
			},
		]);
	});

	it("should flatten arrays", () => {
		const tree = new Map();
		parseProps([1, 2], "foo", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "foo",
				type: "array",
				value: [1, 2],
				children: ["foo.0", "foo.1"],
				meta: null,
			},
			{
				editable: true,
				depth: 1,
				id: "foo.0",
				type: "number",
				value: 1,
				children: [],
				meta: null,
			},
			{
				editable: true,
				depth: 1,
				id: "foo.1",
				type: "number",
				value: 2,
				children: [],
				meta: null,
			},
		]);
	});

	it("should not mark empty arrays as collabsible", () => {
		const tree = new Map();
		parseProps([], "foo", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "foo",
				type: "array",
				value: [],
				children: [],
				meta: null,
			},
		]);
	});

	it("should flatten objects", () => {
		const tree = new Map();
		parseProps({ foo: 123, bar: "abc" }, "", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "",
				type: "object",
				value: {
					foo: 123,
					bar: "abc",
				},
				children: [".foo", ".bar"],
				meta: null,
			},
			{
				editable: true,
				depth: 1,
				id: ".foo",
				type: "number",
				value: 123,
				children: [],
				meta: null,
			},
			{
				editable: true,
				depth: 1,
				id: ".bar",
				type: "string",
				value: "abc",
				children: [],
				meta: null,
			},
		]);
	});

	it("should flatten nested objects", () => {
		const tree = new Map();
		parseProps({ foo: { bar: "abc" } }, "foo", 4, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "foo",
				type: "object",
				value: {
					foo: {
						bar: "abc",
					},
				},
				children: ["foo.foo"],
				meta: null,
			},
			{
				editable: false,
				depth: 1,
				id: "foo.foo",
				type: "object",
				value: {
					bar: "abc",
				},
				children: ["foo.foo.bar"],
				meta: null,
			},
			{
				editable: true,
				depth: 2,
				id: "foo.foo.bar",
				type: "string",
				value: "abc",
				children: [],
				meta: null,
			},
		]);
	});

	it("should limit depth", () => {
		const tree = new Map();
		parseProps({ foo: { bar: "abc" } }, "foo", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "foo",
				type: "object",
				value: {
					foo: {
						bar: "abc",
					},
				},
				children: ["foo.foo"],
				meta: null,
			},
			{
				editable: false,
				depth: 1,
				id: "foo.foo",
				type: "object",
				value: {
					bar: "abc",
				},
				children: ["foo.foo.bar"],
				meta: null,
			},
		]);
	});

	it("should not mark [[Circular]] reference as editable", () => {
		const tree = new Map();
		parseProps("[[Circular]]", "", 2, tree);
		expect(serialize(tree)).to.deep.equal([
			{
				editable: false,
				depth: 0,
				id: "",
				type: "string",
				value: "[[Circular]]",
				children: [],
				meta: null,
			},
		]);
	});

	it("should support meta data", () => {
		const tree = new Map();
		parseProps(
			{
				name: "__meta__",
				value: 123,
				meta: {
					foo: true,
					bob: false,
				},
			},
			[],
			2,
			noop,
			tree,
		);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: false,
				editable: true,
				depth: 0,
				id: "",
				path: [],
				type: "number",
				value: 123,
				children: [],
				meta: {
					foo: true,
					bob: false,
				},
			},
		]);
	});

	it("should support meta object in-between", () => {
		const tree = new Map();
		parseProps(
			{
				name: "__meta__",
				value: {
					a: "A",
					b: "B",
				},
				meta: {
					foo: true,
					bob: false,
				},
			},
			[],
			2,
			noop,
			tree,
		);
		expect(serialize(tree)).to.deep.equal([
			{
				collapsable: true,
				editable: false,
				depth: 0,
				id: "",
				path: [],
				type: "object",
				value: {
					a: "A",
					b: "B",
				},
				children: ["a", "b"],
				meta: {
					foo: true,
					bob: false,
				},
			},
			{
				children: [],
				collapsable: false,
				depth: 0,
				editable: true,
				id: "a",
				meta: null,
				path: ["a"],
				type: "string",
				value: "A",
			},
			{
				children: [],
				collapsable: false,
				depth: 0,
				editable: true,
				id: "b",
				meta: null,
				path: ["b"],
				type: "string",
				value: "B",
			},
		]);
	});
});
