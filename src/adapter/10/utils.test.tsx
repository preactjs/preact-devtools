import { h, Component, createContext, render } from "preact";
import { teardown } from "preact/test-utils";
import { setupScratch } from "./renderer.test";
import { expect } from "chai";
import { cleanContext, cleanProps } from "./utils";
import { getActualChildren } from "./vnode";

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
