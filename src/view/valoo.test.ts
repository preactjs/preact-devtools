import { expect } from "chai";
import * as sinon from "sinon";
import { signal, watch } from "./valoo";

describe("valoo", () => {
	describe("primitive", () => {
		it("should read and write values", () => {
			const a = signal(2);
			expect(a.value).to.eq(2);

			a.value = 3;
			expect(a.value).to.eq(3);
		});

		it("should update mutable values", () => {
			const a = signal([1]);
			a.update(v => {
				v.push(2);
			});
			expect(a.value).to.deep.eq([1, 2]);
		});

		it("should update mutable values without arguments to update", () => {
			const a = signal([1]);
			const spy = sinon.spy();
			a.on(spy);

			a.value.push(2);
			a.update();

			expect(spy.callCount).to.eq(1);
			expect(spy.args[0][0].length).to.eq(2);
			expect(a.value).to.deep.eq([1, 2]);
		});

		it("should call listener", () => {
			const a = signal(1);
			const spy = sinon.spy();
			a.on(spy);

			a.value = 2;
			expect(spy.callCount).to.eq(1);
			expect(spy.args[0]).to.deep.eq([2]);
		});

		it("should dispose listener", () => {
			const a = signal(1);
			const spy = sinon.spy();
			const disp = a.on(spy);

			a.value = 2;
			disp();
			a.value = 3;

			expect(spy.callCount).to.eq(1);
		});
	});

	describe("watch", () => {
		it("should subscribe to dependencies", () => {
			const a = signal(1);
			const b = signal(2);
			const spy = sinon.spy();

			const c = watch(() => a.value + b.value);
			c.on(spy);

			expect(c.value).to.eq(3);

			a.value = 2;
			expect(spy.callCount).to.eq(1);
			expect(c.value).to.eq(4);

			b.value = 3;
			expect(spy.callCount).to.eq(2);
			expect(c.value).to.eq(5);
		});

		it("should unsubscribe from dependencies", () => {
			const a = signal(1);
			const b = signal(2);
			const spy = sinon.spy();

			const c = watch(() => (a.value > 2 ? a.value : b.value));
			c.on(spy);

			a.value = 3;
			expect(spy.callCount).to.eq(1);

			b.value = 3;
			expect(spy.callCount).to.eq(1);
		});

		it("should not track itself", () => {
			const a = signal<number[]>([]);
			const b = signal(1);
			const spy = sinon.spy();

			const c = watch(() => {
				a.update(v => {
					v.push(b.value);
				});
			});
			c.on(spy);

			a.update(v => {
				v.push(3);
			});
			expect(spy.callCount).to.eq(0);
		});

		it("should not watch on callback", () => {
			const a = signal<number[]>([]);
			const b = signal(1);
			const spy = sinon.spy();

			a.on(() => {
				b.value = a.value.length + 1;
			});

			watch(() => {
				a.update(v => {
					v.push(1);
				});

				spy();
			});

			expect(spy.callCount).to.eq(1);
			a.update(v => {
				v.push(5);
			});
			expect(spy.callCount).to.eq(1);
		});
	});
});
