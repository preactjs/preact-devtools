// @ts-ignore
import { preactVersions } from "@preact-list-versions";
// @ts-ignore
import { fixtures } from "@fixtures";
import "../../src/shells/shared/installHook";

function fromUrl() {
	const url = new URL(window.location.href);
	let preact = url.searchParams.get("preact") || null;
	if (preact) {
		preact = preact.replace(/\./g, "_");
	}
	return {
		preact,
		fixtures: url.searchParams.get("fixtures") || null,
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
		// @ts-ignore
		params.set(param, e.target.value.replace(/\./g, "_"));
		window.location.search = params.toString();
	});
}

async function loadFixture() {
	const active = fromUrl();
	if (active.fixtures) {
		const source = new URL(
			`./apps/${active.fixtures}.jsx`,
			window.location.origin,
		);

		const params = source.searchParams;

		const preact = active.preact || preactVersions[0];

		if (preact) {
			params.set("preact", encodeURIComponent(preact.replace(/\./g, "_")));
		}

		try {
			await import(/* @vite-ignore */ source.toString());
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	}
}

async function waitForDevtoolsInit() {
	const iframe = document.querySelector("iframe");
	return new Promise(r => {
		iframe.addEventListener("load", r);
	});
}

(async () => {
	const active = fromUrl();

	if (!active.preact || !active.fixtures) {
		const params = new URLSearchParams();
		params.set(
			"preact",
			active.preact ||
				preactVersions.find(v => !v.includes("-") && v !== "git") ||
				preactVersions[0],
		);
		params.set("fixtures", active.fixtures || fixtures[0]);
		window.location.search = params.toString();
		return;
	}

	// Fixture selector
	appendOptions("#fixture", fixtures, active.fixtures);
	bindToParam("#fixture", "fixtures");

	// Preact version selector
	appendOptions(
		"#preact-version",
		preactVersions,
		active.preact.replace(/_/g, "."),
	);
	bindToParam("#preact-version", "preact");

	// @ts-ignore
	const log = (window.log = []);
	window.addEventListener("message", e => {
		if (e.data.source === "preact-page-hook") {
			(document.querySelector(
				"#devtools",
			) as HTMLIFrameElement).contentWindow.postMessage(e.data, "*");
			log.push(e.data);
		} else if (
			e.data.source === "preact-devtools-to-client" &&
			!e.data._forwarded
		) {
			log.push(e.data);
			window.postMessage({ ...e.data, _forwarded: true }, "*");
			Array.from(document.querySelectorAll("iframe")).forEach(iframe => {
				if (iframe.id !== "devtools") {
					iframe.contentWindow.postMessage(
						{ ...e.data, _forwarded: true },
						"*",
					);
				}
			});
		}
	});

	await waitForDevtoolsInit();

	document.querySelector("iframe").contentWindow.postMessage("foobar", "*");

	await loadFixture();
	document.querySelector("iframe").contentWindow.postMessage("foobar", "*");
})();
