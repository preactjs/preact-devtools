import { h, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, expect, vi } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { AppCtx } from "../store/react-bindings";
import { createStore } from "../store";

describe("ThemeSwitcher", () => {
	let host: HTMLElement | null = null;

	afterEach(() => {
		host?.remove();
		host = null;
		document.body.classList.remove("auto", "light", "dark");
		vi.unstubAllGlobals();
	});

	it("should put the theme class on document.body by default", () => {
		const store = createStore();
		store.theme.value = "dark";
		host = document.createElement("div");
		document.body.appendChild(host);

		act(() => {
			render(
				<AppCtx.Provider value={store}>
					<ThemeSwitcher />
				</AppCtx.Provider>,
				host!,
			);
		});

		expect(document.body.classList.contains("dark")).to.equal(true);
	});

	it("should put the theme class on the closest theme root inside a shadow root", () => {
		vi.stubGlobal("matchMedia", () => ({ matches: false }));
		const store = createStore();
		store.theme.value = "dark";

		host = document.createElement("div");
		document.body.appendChild(host);
		const shadow = host.attachShadow({ mode: "open" });
		const themeRoot = document.createElement("div");
		themeRoot.setAttribute("data-devtools-theme-root", "");
		shadow.appendChild(themeRoot);

		act(() => {
			render(
				<AppCtx.Provider value={store}>
					<ThemeSwitcher />
				</AppCtx.Provider>,
				themeRoot,
			);
		});

		expect(themeRoot.classList.contains("dark")).to.equal(true);
		expect(document.body.classList.contains("dark")).to.equal(false);

		act(() => {
			store.theme.value = "auto";
		});
		expect(themeRoot.classList.contains("dark")).to.equal(false);
		expect(themeRoot.classList.contains("light")).to.equal(true);
	});
});
