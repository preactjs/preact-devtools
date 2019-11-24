import { h } from "preact";
import { expect } from "chai";
import { render, fireEvent } from "@testing-library/preact";
import { DataInput } from ".";
import { act } from "preact/test-utils";

const noop = () => null;

describe("DataInput", () => {
	it("should update local value when value changes", () => {
		const { rerender, container } = render(
			<DataInput value="foo" onChange={noop} initialValue="asdf" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;
		expect(input.value).to.equal('"foo"');

		fireEvent.change(input, {
			target: { value: '"bar"' },
			currentTarget: { value: '"bar"' },
		});

		expect(input.value).to.equal('"bar"');

		rerender(<DataInput value="baz" onChange={noop} initialValue="foo" />);
		expect(input.value).to.equal('"baz"');
	});

	it("should serialize value to human on focus", () => {
		const { container } = render(
			<DataInput value="foo" onChange={noop} initialValue="asdf" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;

		expect(input.value).to.equal('"foo"');
		fireEvent.focus(input);
		expect(input.value).to.equal('"foo"');
	});

	it("should update mask", () => {
		const { container } = render(
			<DataInput value="foo" onChange={noop} initialValue="asdf" />,
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
		const { container } = render(
			<DataInput value={{ foo: 1 }} onChange={noop} initialValue="asdf" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;
		expect(input.value).to.equal("Object");
	});

	// Focus handling seems to be wrong in our testing framework
	it.skip("should not mask objects when focused", () => {
		const { container } = render(
			<DataInput value={{ foo: 1 }} onChange={noop} initialValue="asdf" />,
		);

		const input = container.querySelector("input") as HTMLInputElement;
		act(() => {
			fireEvent.focus(input);
		});
		expect(input.value).to.equal("{foo:1}");
	});
});
