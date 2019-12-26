import { h } from "preact";
import { expect } from "chai";
import { renderTest } from "../DataInput/DataInput.test";
import { CommitTimeline } from "./CommitTimeline";
import { fireEvent } from "@testing-library/preact";

const noop = () => null;

describe("CommitTimeline", () => {
	it("should render 4 items", () => {
		const { $$ } = renderTest(
			<CommitTimeline onChange={noop} selected={0} items={[20, 80, 10, 10]} />,
		);
		expect($$('[data-e2e="commit-item"]').length).to.equal(4);
	});

	it("should disable prev button if selection === 0", () => {
		const { e2e, $$ } = renderTest(
			<CommitTimeline onChange={noop} selected={0} items={[20, 80, 10, 10]} />,
		);
		expect(e2e("prev-commit")?.hasAttribute("disabled")).to.equal(true);

		const items = Array.from($$("[data-e2e='commit-item']"));
		fireEvent.click(items[2]);
		expect(e2e("prev-commit")?.hasAttribute("disabled")).to.equal(false);
	});

	it("should disable next button if selection === items.length", () => {
		const { e2e, $$ } = renderTest(
			<CommitTimeline onChange={noop} selected={0} items={[20, 80, 10, 10]} />,
		);
		expect(e2e("next-commit")?.hasAttribute("disabled")).to.equal(false);

		const items = Array.from($$("[data-e2e='commit-item']"));
		const last = items[items.length - 1];
		fireEvent.click(last);

		expect(e2e("next-commit")?.hasAttribute("disabled")).to.equal(true);
	});
});
