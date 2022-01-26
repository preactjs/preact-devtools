import { expect } from "chai";
import { jsonify } from "./serialize";

describe("jsonify", () => {
	it("should clean circular references", () => {
		const data1: any = { foo: 123 };
		data1.foo = data1;
		expect(jsonify(data1, () => null, new Set())).to.deep.equal({
			foo: "[[Circular]]",
		});

		const data2: any = { foo: [] };
		data2.foo.push(data2);
		expect(jsonify(data2, () => null, new Set())).to.deep.equal({
			foo: ["[[Circular]]"],
		});
	});

	it("should not treat values as circular", () => {
		const data: any = { foo: 123, bar: { foo: 123 } };
		expect(jsonify(data, () => null, new Set())).to.deep.equal({
			foo: 123,
			bar: { foo: 123 },
		});
	});

	it("should parse symbols", () => {
		const data: any = Symbol("foo");
		expect(jsonify(data, () => null, new Set())).to.deep.equal({
			type: "symbol",
			name: "Symbol(foo)",
		});
	});
});
