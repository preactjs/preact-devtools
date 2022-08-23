import { h } from "preact";
import { expect } from "chai";
import { act } from "preact/test-utils";
import { signal } from "../valoo";
import { useObserver } from "./react-bindings";
import { renderTest } from "../components/profiler/components/CommitTimeline/CommitTimeline.test";

describe("useObserver", () => {
	it("should render on update", () => {
		const v = signal(0);
		const Foo = () => {
			const x = useObserver(() => v.$);
			return <div>{x}</div>;
		};
		const { container } = renderTest(<Foo />);
		expect(container.textContent).to.equal("0");

		act(() => {
			v.$ = 42;
		});

		expect(container.textContent).to.equal("42");
	});

	it("should render on complex value update", () => {
		const v = signal([1]);
		const Foo = () => {
			const x = useObserver(() => v.$);
			return <div>{x.join(",")}</div>;
		};
		const { container } = renderTest(<Foo />);
		expect(container.textContent).to.equal("1");

		act(() => {
			v.update(n => {
				n.push(2, 3);
			});
		});

		expect(container.textContent).to.equal("1,2,3");
	});
});
