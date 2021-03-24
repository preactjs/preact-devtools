// @ts-ignore
import { preactVersions } from "@preact-list-versions";
// @ts-ignore
import { testCases } from "@test-cases";

function fromUrl() {
	const url = new URL(window.location.href);
	return {
		preact: url.searchParams.get("preact") || null,
		test: url.searchParams.get("test") || null,
	};
}

function createOption(name: string, value: string) {
	const el = document.createElement("option");
	el.value = value;
	el.textContent = name;
	return el;
}

function appendOptions(selector: string, values: string[], active?: string) {
	const select = document.querySelector(selector);
	select.append(
		...values.map(v => {
			const option = createOption(v, v);
			if (active !== undefined && v === active) {
				option.selected = true;
			}
			return option;
		}),
	);
}

function bindToParam(selector: string, param: string) {
	const select = document.querySelector(selector) as HTMLSelectElement;
	select.addEventListener("change", e => {
		const params = new URLSearchParams(window.location.search);
		params.set(param, e.target.value);
		window.location.search = params.toString();
	});
}

const active = fromUrl();

// Fixture selector
appendOptions("#test-case", testCases, active.test);
bindToParam("#test-case", "test");

// Preact version selector
appendOptions("#preact-version", preactVersions, active.preact);
bindToParam("#preact-version", "preact");
