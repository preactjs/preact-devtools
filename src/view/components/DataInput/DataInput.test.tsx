import { h, ComponentChild } from "preact";
import { expect } from "chai";
import * as sinon from "sinon";
import { render, fireEvent } from "@testing-library/preact";
import { DataInput } from ".";
import { act } from "preact/test-utils";

const noop = () => null;

export function renderTest(ui: ComponentChild) {
	const res = render(ui);
	return {
		...res,
		$: (sel: string) => res.container.querySelector(sel),
		$$: (sel: string) => res.container.querySelectorAll(sel),
	};
}

describe("DataInput", () => {
	it.skip("should update local value when value changes", () => {
		const { rerender, container } = renderTest(
			<DataInput value="foo" onChange={noop} name="foo" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;
		expect(input.value).to.equal('"foo"');

		fireEvent.change(input, {
			target: { value: '"bar"' },
			currentTarget: { value: '"bar"' },
		});

		expect(input.value).to.equal('"bar"');

		rerender(<DataInput value="baz" onChange={noop} name="foo" />);
		expect(input.value).to.equal('"baz"');
	});

	it("should serialize value to human on focus", () => {
		const { container } = renderTest(
			<DataInput value="foo" onChange={noop} name="foo" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;

		expect(input.value).to.equal('"foo"');
		fireEvent.focus(input);
		expect(input.value).to.equal('"foo"');
	});

	it.skip("should update mask", () => {
		const { container } = renderTest(
			<DataInput value="foo" onChange={noop} name="foo" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;

		expect(input.value).to.equal('"foo"');

		fireEvent.focus(input);
		fireEvent.input(input, {
			target: { value: '"bar"' },
			currentTarget: { value: '"bar"' },
		});
		fireEvent.blur(input);

		expect(input.value).to.equal('"bar"');
	});

	it("should have short mask when not focused", () => {
		const { container } = renderTest(
			<DataInput value={{ foo: 1 }} onChange={noop} name="foo" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;
		expect(input.value).to.equal("Object");
	});

	// Focus handling seems to be wrong in our testing framework
	it.skip("should not mask objects when focused", () => {
		const { container } = renderTest(
			<DataInput value={{ foo: 1 }} onChange={noop} name="foo" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;
		act(() => {
			fireEvent.focus(input);
		});
		expect(input.value).to.equal("{foo:1}");
	});

	describe("Checkbox", () => {
		it("should display a checkbox for boolean values", () => {
			const { $ } = renderTest(
				<DataInput value={true} onChange={noop} name="foo" />,
			);

			const input = $("input[type='text']") as HTMLInputElement;
			expect(input.value).to.equal("true");

			const check = $("input[type='checkbox']") as HTMLInputElement;
			expect(check.checked).to.equal(true);
		});

		it("should change value on click", () => {
			const spy = sinon.spy();
			const { $ } = renderTest(
				<DataInput value={true} onChange={spy} name="foo" />,
			);

			const check = $("input[type='checkbox']") as HTMLInputElement;
			fireEvent.click(check);
			expect(spy.args[0][0]).to.equal(false);
			expect(check.checked).to.equal(false);
		});
	});
});
