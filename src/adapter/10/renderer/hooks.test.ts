import { expect } from "chai";
import { parseHookData } from "./hooks";
import { RendererConfig10 } from "../renderer";
import { Fragment, Component } from "preact";

const useStateAndCallback = [
	{
		type: 1,
		stack: [
			{
				line: 23,
				column: 19,
				type: "",
				name: "d",
				raw: "    at d (/vendor/preactHooks.js:23:19)",
			},
		],
	},
	{
		type: 7,
		stack: [
			{
				line: 46,
				column: 11,
				type: "",
				name: "l",
				raw: "    at l (/vendor/preactHooks.js:46:11)",
			},
			{
				line: 167,
				column: 5,
				type: "",
				name: "n",
				raw: "    at n.useCallback (/vendor/preactHooks.js:167:5)",
			},
		],
	},
];

const customHooks = [
	{
		type: 3,
		stack: [
			{
				line: 140,
				column: 12,
				type: "",
				name: "n",
				raw: "    at n.useEffect (/vendor/preactHooks.js:140:12)",
			},
			{
				line: 51,
				column: 2,
				type: "",
				name: "useBar",
				raw: "    at useBar (/test-case.js:51:2)",
			},
			{
				line: 56,
				column: 9,
				type: "",
				name: "useFoo",
				raw: "    at useFoo (/test-case.js:56:9)",
			},
		],
	},
	{
		type: 1,
		stack: [
			{
				line: 23,
				column: 19,
				type: "",
				name: "d",
				raw: "    at d (/vendor/preactHooks.js:23:19)",
			},
			{
				line: 52,
				column: 9,
				type: "",
				name: "useBar",
				raw: "    at useBar (/test-case.js:52:9)",
			},
			{
				line: 56,
				column: 9,
				type: "",
				name: "useFoo",
				raw: "    at useFoo (/test-case.js:56:9)",
			},
		],
	},
];

const config: RendererConfig10 = {
	Fragment: Fragment as any,
	Component: Component as any,
};

describe("parseHookData", () => {
	it("should parse sibling hooks", () => {
		expect(parseHookData(config, useStateAndCallback)).to.deep.equal([]);
	});
});
