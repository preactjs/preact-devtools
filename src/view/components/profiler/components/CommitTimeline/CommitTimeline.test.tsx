import { h } from "preact";
import { expect } from "chai";
import { renderTest } from "../../../DataInput/DataInput.test";
import { CommitTimeline } from "./CommitTimeline";
import { fireEvent } from "@testing-library/preact";
import * as sinon from "sinon";

const noop = () => null;

describe("CommitTimeline", () => {
	it("should render 4 items", () => {
		const { $$ } = renderTest(
			<CommitTimeline onChange={noop} selected={0} items={[20, 80, 10, 10]} />,
		);
		expect($$('[data-testid="commit-item"]').length).to.equal(4);
	});

	it("should wrap around if selection === 0", () => {
		const spy = sinon.spy();
		const { $ } = renderTest(
			<CommitTimeline onChange={spy} selected={0} items={[20, 80, 10, 10]} />,
		);

		const btn = $("[data-testid='prev-commit']")!;
		fireEvent.click(btn);
		expect(spy.args[0][0]).to.equal(3);
	});

	it("should wrap around if selection === items.length", () => {
		const spy = sinon.spy();
		const { $ } = renderTest(
			<CommitTimeline onChange={spy} selected={3} items={[20, 80, 10, 10]} />,
		);

		const btn = $("[data-testid='next-commit']")!;
		fireEvent.click(btn);

		expect(spy.args[0][0]).to.equal(0);
	});
});
