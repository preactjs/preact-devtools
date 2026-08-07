import { expect } from "vitest";
import {
	getDisplayName,
	getPropsVNodeDisplayName,
	TYPE_FUNCTION,
} from "./bindings";

describe("Preact 11 bindings", () => {
	it("should detect context providers without a private back-reference", () => {
		const context: any = Object.assign(() => null, {
			displayName: "Foobar",
			__: "default value",
		});
		context.Provider = context;

		const config = { Fragment: () => null };
		expect(
			getPropsVNodeDisplayName({ type: context, props: {} } as any, config),
		).to.equal("Foobar.Provider");
		expect(
			getDisplayName({ type: context, flags: TYPE_FUNCTION } as any, config),
		).to.equal("Foobar.Provider");
	});
});
