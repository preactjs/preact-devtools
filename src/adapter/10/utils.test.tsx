import { h, Component, createContext, render } from "preact";
import { teardown } from "preact/test-utils";
import { setupScratch } from "./renderer.test";
import { expect } from "chai";
import { cleanContext, cleanProps, jsonify, setInCopy } from "./utils";
import { getActualChildren } from "./vnode";

describe("cleanContext", () => {
	let scratch: HTMLDivElement;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown();
		scratch.remove();
	});

	it("should remove createContext items", () => {
		class LegacyProvider extends Component<{ children: any }> {
			getChildContext() {
				return { foo: 1 };
			}

			render() {
				return this.props.children;
			}
		}

		let contextValue: any;
		function Child(props: any, context: any) {
			contextValue = context;
			return <div>child</div>;
		}

		const ctx = createContext<any>(null);
		render(
			<LegacyProvider>
				<ctx.Provider value="a">
					<ctx.Consumer>{() => <Child />}</ctx.Consumer>
				</ctx.Provider>
			</LegacyProvider>,
			scratch,
		);

		expect(cleanContext(contextValue)).to.deep.equal({
			foo: 1,
		});
	});

	it("should return null when no context value is present", () => {
		expect(cleanContext({})).to.equal(null);
	});
});

describe("cleanProps", () => {
	let scratch: HTMLDivElement;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown();
		scratch.remove();
	});

	it("should return null if props is empty", () => {
		const vnode = h("div", {});
		expect(cleanProps(vnode.props)).to.equal(null);
	});

	it("should bail out if props is null", () => {
		const vnode = h("div", null);
		expect(cleanProps(vnode.props)).to.equal(null);
	});

	it("should return null for text vnodes", () => {
		const parent = h("div", {}, "foo");
		render(parent, scratch);

		const child = getActualChildren(parent)[0]!;
		expect(cleanProps(child.props)).to.equal(null);
	});

	it("should filter out __source", () => {
		const vnode = h("div", { __source: "foo", foo: 1 });
		expect(cleanProps(vnode.props)).to.deep.equal({ foo: 1 });
	});

	it("should filter out __self", () => {
		const vnode = h("div", { __self: "foo", foo: 1 });
		expect(cleanProps(vnode.props)).to.deep.equal({ foo: 1 });
	});
});

describe("jsonify", () => {
	it("should clean circular references", () => {
		const data1: any = { foo: 123 };
		data1.foo = data1;
		expect(jsonify(data1, () => null, new Set())).to.deep.equal({
			foo: "[[Circular]]",
		});

		const data2: any = { foo: [] };
		data2.foo.push(data2);
		expect(jsonify(data2, () => null, new Set())).to.deep.equal({
			foo: ["[[Circular]]"],
		});
	});

	it("should not treat values as circular", () => {
		const data: any = { foo: 123, bar: { foo: 123 } };
		expect(jsonify(data, () => null, new Set())).to.deep.equal({
			foo: 123,
			bar: { foo: 123 },
		});
	});
});

describe("setInCopy", () => {
	it("should update arrays", () => {
		const obj = { foo: [1] };
		const res = setInCopy(obj, ["foo", 0], 2);
		expect(res).to.deep.equal({
			foo: [2],
		});
		expect(res).not.equal(obj);
		expect(res.foo).not.equal(obj.foo);
	});

	it("should not mutate existing object", () => {
		const obj = { foo: { bar: 1 } };
		const res = setInCopy(obj, ["foo", "bar"], 2);
		expect(res).to.deep.equal({
			foo: { bar: 2 },
		});
		expect(res).not.equal(obj);
		expect(res.foo).not.equal(obj.foo);
	});
});
