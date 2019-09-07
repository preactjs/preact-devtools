import { h, render, Options, options } from "preact";
import * as sinon from "sinon";
import { createRenderer } from "./renderer";
import { setupOptions } from "../adapter";
import { DevtoolsHook } from "../hook";
import { expect } from "chai";

export function setupScratch() {
	const div = document.createElement("div");
	div.id = "scratch";
	document.body.appendChild(div);
	return div;
}

export function setupMockHook(options: Options) {
	const spy = sinon.spy();
	const fakeHook: DevtoolsHook = {
		connected: true,
		attach: () => 1,
		detach: () => null,
		emit: spy,
		renderers: new Map(),
	};
	const renderer = createRenderer(fakeHook);
	const destroy = setupOptions(options, renderer);
	return {
		destroy,
		spy,
	};
}

describe("Renderer 10", () => {
	let scratch: HTMLDivElement;
	let destroy: () => void;
	let spy: sinon.SinonSpy;

	beforeEach(() => {
		scratch = setupScratch();
		const mock = setupMockHook(options);
		destroy = mock.destroy;
		spy = mock.spy;
	});

	afterEach(() => {
		scratch.remove();
		if (destroy) destroy();
	});

	it("should detect root nodes", () => {
		render(<div />, scratch);
		expect(spy.args[0][1][0]).to.equal(1);

		render(<div />, scratch);
		expect(spy.args[1][1][0]).to.equal(1);
	});
});
