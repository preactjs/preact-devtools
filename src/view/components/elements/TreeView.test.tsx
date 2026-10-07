import { h } from "preact";
import { render } from "@testing-library/preact";
import { HocLabels, TreeItem } from "./TreeView";
import { expect } from "vitest";
import { AppCtx } from "../../store/react-bindings";
import { createStore } from "../../store";
import { DevNodeType } from "../../store/types";

describe("TreeItem", () => {
	it("should limit key length to 15", () => {
		const store = createStore();
		store.nodes.value.set(1, {
			children: [],
			depth: 1,
			endTime: 0,
			key: "abcdefghijklmnopqrstuvxyz",
			id: 1,
			hocs: null,
			name: "foo",
			owner: -1,
			parent: -1,
			startTime: 0,
			type: DevNodeType.ClassComponent,
		});
		const { container, rerender } = render(
			<AppCtx.Provider value={store}>
				<TreeItem id={1} key="" top={0} />,
			</AppCtx.Provider>,
		);
		expect(container.textContent).to.equal('foo key="abcdefghijklmno…",');

		store.nodes.value.get(1)!.key = "foobar";
		store.nodes.value = new Map(store.nodes.value);
		rerender(
			<AppCtx.Provider value={store}>
				<TreeItem id={1} key="" top={0} />,
			</AppCtx.Provider>,
		);

		expect(container.textContent).to.equal('foo key="foobar",');
	});

	it("should collapse overflowing HOC labels behind a count badge", () => {
		const { container } = render(
			<HocLabels
				hocs={["withFoo", "withBar", "withBaz", "withQux"]}
				nodeId={1}
				canMark={false}
				maxVisible={2}
			/>,
		);

		const labels = container.querySelectorAll('[data-hoc-kind="label"]');
		expect(labels).to.have.length(2);
		expect(labels[0].textContent).to.equal("withFoo");
		expect(labels[1].textContent).to.equal("withBar");
		expect(
			container.querySelector('[data-hoc-kind="overflow"]')?.textContent,
		).to.equal("+2");
	});

	it("should show only the HOC count badge when maxVisible is 0", () => {
		const { container } = render(
			<HocLabels
				hocs={["withFoo", "withBar", "withBaz"]}
				nodeId={1}
				canMark={false}
				maxVisible={0}
			/>,
		);

		expect(
			container.querySelectorAll('[data-hoc-kind="label"]'),
		).to.have.length(0);
		expect(
			container.querySelector('[data-hoc-kind="overflow"]')?.textContent,
		).to.equal("+3");
	});

	it("should show all HOC labels when maxVisible is not set", () => {
		const { container } = render(
			<HocLabels hocs={["withFoo", "withBar"]} nodeId={1} canMark={false} />,
		);

		expect(
			container.querySelectorAll('[data-hoc-kind="label"]'),
		).to.have.length(2);
		expect(container.querySelector('[data-hoc-kind="overflow"]')).to.equal(
			null,
		);
	});
});
