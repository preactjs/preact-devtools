import "./global.css";
import { initPreact10, renderExamples10 } from "./examples/10/setup";
import { DevtoolsHook, createHook } from "./adapter/hook";
import { setupFrontendStore } from "./examples/inline-devtools/setup";
import { h, render } from "preact";
import { useState } from "preact/hooks";
import { DevTools } from "./view/components/Devtools";
import { CommitTimeline } from "./view/components/profiler/components/CommitTimeline/CommitTimeline";
import s from "./view/components/Devtools.css";
import { createPortForHook } from "./adapter/adapter/port";

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
	const port = createPortForHook(window);
	hook = (window as any).__PREACT_DEVTOOLS__ = createHook(port);
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

const styleGuide = div("styleguide");
container.appendChild(styleGuide);

// Devtools, must be the first one to be initialised
const { store } = setupFrontendStore(window);
render(<DevTools store={store} />, devtools);

// Preact 10 examples
initPreact10(hook);
renderExamples10(examples10);

function StyleGuide() {
	const [c1, setC1] = useState(0);
	const [c2, setC2] = useState(0);
	const [c3, setC3] = useState(0);
	return (
		<div class={s.theme}>
			<p>Commit Timeline</p>
			<div style="max-width: 18rem; border-right: 4px solid red; border-left: 4px solid red; height: 2rem">
				<CommitTimeline items={[40]} selected={c3} onChange={setC3} />
			</div>
			<br />
			<div style="max-width: 18rem; border-right: 4px solid red; border-left: 4px solid red; height: 2rem">
				<CommitTimeline items={[40, 100]} selected={c1} onChange={setC1} />
			</div>
			<br />
			<div style="max-width: 18rem; border-right: 4px solid red; border-left: 4px solid red; height: 2rem">
				<CommitTimeline
					items={[40, 100, 20, 30, 100, 92, 12, 38, 12, 87, 23, 14, 68]}
					selected={c2}
					onChange={setC2}
				/>
			</div>
			<br />
			<br />
			<br />
			<br />
		</div>
	);
}

// Styleguide
render(<StyleGuide />, styleGuide);
