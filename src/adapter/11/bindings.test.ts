import { expect } from "vitest";
import { getDisplayName, isPortal } from "./bindings";

describe("Preact 11 bindings", () => {
	it("detects core portals", () => {
		for (const props of [{ _parentDom: {} }, { __P: {} }]) {
			const vnode = { type: () => null, props } as any;

			expect(isPortal(vnode)).toBe(true);
			expect(getDisplayName(vnode, { Fragment: () => null })).toBe("Portal");
		}
	});

	it("does not treat text VNodes as portals", () => {
		expect(isPortal({ type: null, props: "text" } as any)).toBe(false);
	});

	it("detects context providers without a private back-reference", () => {
		const context: any = Object.assign(() => null, {
			displayName: "Foobar",
		});
		context.Provider = context;

		expect(
			getDisplayName({ type: context, props: {} } as any, {
				Fragment: () => null,
			}),
		).toBe("Foobar.Provider");
	});
});
