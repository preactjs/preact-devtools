import "./global.css";
import { initPreact10, renderExamples10 } from "./examples/10/setup";
import { DevtoolsHook, createHook } from "./adapter/hook";
import { setupInlineDevtools } from "./examples/inline-devtools/setup";
import { createSimpleBridge } from "./examples/inline-devtools/simple-bridge";

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

// Devtools, must be the first one to be initialised
setupInlineDevtools(devtools, hook);

// Preact 10 examples
initPreact10(hook);
renderExamples10(examples10);
