import { expect } from "chai";
import * as sinon from "sinon";
import { valoo, watch } from "./valoo";

describe("valoo", () => {
	describe("primitive", () => {
		it("should read and write values", () => {
			let a = valoo(2);
			expect(a.$).to.eq(2);

			a.$ = 3;
			expect(a.$).to.eq(3);
		});

		it("should update mutable values", () => {
			let a = valoo([1]);
			a.update(v => {
				v.push(2);
			});
			expect(a.$).to.deep.eq([1, 2]);
		});

		it("should update mutable values without arguments to update", () => {
			let a = valoo([1]);
			let spy = sinon.spy();
			a.on(spy);

			a.$.push(2);
			a.update();

			expect(spy.callCount).to.eq(1);
			expect(spy.args[0][0].length).to.eq(2);
			expect(a.$).to.deep.eq([1, 2]);
		});

		it("should call listener", () => {
			let a = valoo(1);
			let spy = sinon.spy();
			a.on(spy);

			a.$ = 2;
			expect(spy.callCount).to.eq(1);
			expect(spy.args[0]).to.deep.eq([2]);
		});

		it("should dispose listener", () => {
			let a = valoo(1);
			let spy = sinon.spy();
			let disp = a.on(spy);

			a.$ = 2;
			disp();
			a.$ = 3;

			expect(spy.callCount).to.eq(1);
		});
	});

	describe("watch", () => {
		it("should subscribe to dependencies", () => {
			let a = valoo(1);
			let b = valoo(2);
			let spy = sinon.spy();

			let c = watch(() => a.$ + b.$);
			c.on(spy);

			expect(c.$).to.eq(3);

			a.$ = 2;
			expect(spy.callCount).to.eq(1);
			expect(c.$).to.eq(4);

			b.$ = 3;
			expect(spy.callCount).to.eq(2);
			expect(c.$).to.eq(5);
		});

		it("should unsubscribe from dependencies", () => {
			let a = valoo(1);
			let b = valoo(2);
			let spy = sinon.spy();

			let c = watch(() => (a.$ > 2 ? a.$ : b.$));
			c.on(spy);

			a.$ = 3;
			expect(spy.callCount).to.eq(1);

			b.$ = 3;
			expect(spy.callCount).to.eq(1);
		});

		it("should not track itself", () => {
			let a = valoo<number[]>([]);
			let b = valoo(1);
			let spy = sinon.spy();

			let c = watch(() => {
				a.update(v => {
					v.push(b.$);
				});
			});
			c.on(spy);

			a.update(v => {
				v.push(3);
			});
			expect(spy.callCount).to.eq(0);
		});

		it("should not watch on callback", () => {
			let a = valoo<number[]>([]);
			let b = valoo(1);
			let spy = sinon.spy();

			a.on(() => {
				b.$ = a.$.length + 1;
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
