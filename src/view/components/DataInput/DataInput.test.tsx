import { h } from "preact";
import { expect } from "chai";
import { render, fireEvent } from "@testing-library/preact";
import { DataInput } from ".";

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
});
