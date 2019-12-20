import "./global.css";
import { initPreact10, renderExamples10 } from "./examples/10/setup";
import { DevtoolsHook, createHook } from "./adapter/hook";
import {
	setupInlineDevtools,
	setupFrontendStore,
} from "./examples/inline-devtools/setup";
import { createSimpleBridge } from "./examples/inline-devtools/simple-bridge";
import { h, render } from "preact";
import { DevTools } from "./view/components/Devtools";
import { Profiler } from "./view/components/profiler/Profiler";

function div(id: string) {
	const el = document.createElement("div");
	el.id = id;
	return el;
}

let hook: DevtoolsHook = (window as any).__PREACT_DEVTOOLS__;

// Create a mock hook if none was injected
if (hook == null) {
	console.info(
		`No injected hook found, using a mocked one instead.
This happens when the "preact-devtools" extension was not found or is not active.`,
	);
	const bridge = createSimpleBridge();
	hook = (window as any).__PREACT_DEVTOOLS__ = createHook(bridge);
	hook.connected = true;
}

// Prepare dom
const devtools = div("devtools");
devtools.style.cssText = `
	overflow: hidden;
	height: 45rem;
	max-height: 40%;
	border-top: 1px solid #666;
`;

const wrapper = div("wrapper");
wrapper.style.cssText = `
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;
`;
const container = div("container");
container.style.cssText = `
	overflow: auto;
`;

const examples10 = div("preact-10");
examples10.style.cssText = "position: relative";
document.body.appendChild(wrapper);
wrapper.appendChild(container);
wrapper.appendChild(devtools);
container.appendChild(examples10);

// Radio
const radio = `
	<form>
		<select id="devtools-type">
			<option value="elements">Elements</option>
			<option value="profiler">Profiler</option>
		</select>
	</form>
`;

devtools.innerHTML = radio;

const devtoolsInner = document.createElement("div");
devtoolsInner.style.cssText = `
	z-index: 999;
	position: relative;
`;
devtools.appendChild(devtoolsInner);

// Devtools, must be the first one to be initialised
const { store } = setupFrontendStore(hook);
const switcher = devtools.querySelector("#devtools-type")!;
switcher.addEventListener("input", e => {
	const panel = (e.target as any).value;
	sessionStorage.setItem("inline-panel", panel);
	if (panel === "elements") {
		render(<DevTools store={store} />, devtoolsInner);
	} else if (panel === "profiler") {
		render(<Profiler store={store} />, devtoolsInner);
	}
});

const panel = sessionStorage.getItem("inline-panel") || "elements";
renderInline(store, panel);

function renderInline(store: any, panel: string) {
	if (panel === "elements") {
		render(<DevTools store={store} />, devtoolsInner);
	} else if (panel === "profiler") {
		render(<Profiler store={store} />, devtoolsInner);
	}
}

// Preact 10 examples
initPreact10(hook);
renderExamples10(examples10);
