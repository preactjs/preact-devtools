import { h, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, expect, vi } from "vitest";
import { CONTAINER_RESIZE_EVENT, useResize } from "./utils";

describe("useResize", () => {
	let host: HTMLElement | null = null;

	afterEach(() => {
		if (host) render(null, host);
		host?.remove();
		host = null;
	});

	function mount(fn: () => void) {
		function App() {
			useResize(fn, []);
			return null;
		}
		host = document.createElement("div");
		document.body.appendChild(host);
		act(() => {
			render(<App />, host!);
		});
	}

	it("should call the callback on window resize", () => {
		const fn = vi.fn();
		mount(fn);
		window.dispatchEvent(new Event("resize"));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("should call the callback when the embedder signals a container resize", () => {
		const fn = vi.fn();
		mount(fn);
		window.dispatchEvent(new Event(CONTAINER_RESIZE_EVENT));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("should stop listening after unmount", () => {
		const fn = vi.fn();
		mount(fn);
		act(() => {
			render(null, host!);
		});
		window.dispatchEvent(new Event(CONTAINER_RESIZE_EVENT));
		expect(fn).not.toHaveBeenCalled();
	});
});
