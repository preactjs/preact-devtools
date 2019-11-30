import { valoo } from "../../valoo";
import { createInputStore } from "./inputState";
import { expect } from "chai";

describe("DataInputState", () => {
	it("should render a checkbox if value is a boolean", () => {
		const value = valoo<any>(false);
		const s = createInputStore(value);
		expect(s.asCheckbox.$).to.equal(true);

		value.$ = true;
		expect(s.asCheckbox.$).to.equal(true);

		value.$ = "foo";
		expect(s.asCheckbox.$).to.equal(false);
	});

	it("should format value", () => {
		const value = valoo<any>(false);
		const s = createInputStore(value);
		expect(s.actualValue.$).to.equal("false");
	});

	it("should detect type", () => {
		const value = valoo<any>([]);
		const s = createInputStore(value);
		expect(s.valueType.$).to.equal("array");
	});

	it("should detect invalid type", () => {
		const value = valoo<any>([]);
		const s = createInputStore(value);
		s.onInput("{...");
		expect(s.valueType.$).to.equal("array");
	});

	it("should not lose value on blur", () => {
		const value = valoo("foo");
		const s = createInputStore(value);
		s.onBlur();
		expect(value.$).to.equal("foo");
	});

	describe("validity", () => {
		it("should mark values as valid", () => {
			const value = valoo<any>([]);
			const s = createInputStore(value);
			expect(s.valid.$).to.equal(true);
		});

		it("should not change value if local one is invalid", () => {
			const value = valoo("foo");
			const s = createInputStore(value);
			s.onFocus();
			s.onInput("{...");
			s.onConfirm();
			expect(s.valid.$).to.equal(false);
			expect(s.actualValue.$).to.equal("{...");
		});

		it("should not update value when invalid", () => {
			const value = valoo("foo");
			const s = createInputStore(value);
			s.onFocus();
			s.onInput("{...");
			s.onConfirm();
			expect(s.valid.$).to.equal(false);
			expect(value.$).to.equal("foo");
		});

		it("should update value when valid", () => {
			const value = valoo("foo");
			const s = createInputStore(value);
			s.onInput("{...");
			s.onConfirm();
			expect(s.valid.$).to.equal(false);
			expect(value.$).to.equal("foo");

			s.onInput('"bar"');
			s.onConfirm();
			expect(s.valid.$).to.equal(true);
			expect(value.$).to.equal("bar");
		});
	});

	describe("number", () => {
		it("should increment numeric value", () => {
			const value = valoo(2);
			const s = createInputStore(value);
			s.onFocus();
			s.onIncrement();
			s.onConfirm();
			expect(value.$).to.equal(3);
		});

		it("should decrease numeric value", () => {
			const value = valoo(2);
			const s = createInputStore(value);
			s.onFocus();
			s.onDecrement();
			s.onConfirm();
			expect(value.$).to.equal(1);
		});
	});
});
