const { h, render, createContext, createRef } = preact;
const {
	useState,
	useEffect,
	useLayoutEffect,
	useCallback,
	useMemo,
	useRef,
	useContext,
	useImperativeHandle,
	useErrorBoundary,
	useDebugValue,
} = preactHooks;

function Display(props) {
	return html` <div data-testid=${props.testId}>Counter: ${props.value}</div> `;
}

function Counter() {
	const [v, set] = useState(0);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} testId="result" />
			<button onClick=${() => set(v + 1)}>Increment</button>
		</div>
	`;
}

function CallbackOnly() {
	const cb = useCallback(() => 2, []);

	return html`
		<div style="padding: 2rem;">
			<${Display} value="0" testId="callback-result" />
			<button onClick=${cb}>Increment</button>
		</div>
	`;
}

function CounterCallback() {
	const [v, set] = useState(0);
	const cb = useCallback(() => set(v + 1), [v]);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} testId="callback-result" />
			<button onClick=${cb}>Increment</button>
		</div>
	`;
}

let layoutEffect = 0;
function LayoutEffect() {
	useLayoutEffect(() => {
		layoutEffect++;
	}, []);

	return html`<p>LayoutEffect: ${layoutEffect}</p>`;
}

let effect = 0;
function Effect() {
	useEffect(() => {
		effect++;
	}, []);

	return html`<p>effect: ${effect}</p>`;
}

function Memo() {
	const v = useMemo(() => 0, []);
	return html`<p>Memo: ${v}</p>`;
}

function RefComponent() {
	const v = useRef(0);
	return html`<p>Ref: ${v.current}</p>`;
}

const Ctx = createContext(0);

function ContextComponent() {
	const v = useContext(Ctx);
	return html`<p>Context: ${v}</p>`;
}

function ContextNoProvider() {
	const v = useContext(Ctx);
	return html`<p>NoProvider: ${v}</p>`;
}

let customHook = 0;
const useBar = () => {
	useEffect(() => customHook++, []);
	return useState(false);
};

const useFoo = () => {
	return useBar();
};

function CustomHooks() {
	const [v] = useFoo();
	return html`<p>Custom hooks: ${"" + v}, ${customHook}</p>`;
}

function CustomHooks2() {
	const [v] = useBar();
	const [v2] = useBar();
	return html`<p>Custom hooks: ${"" + v}, ${"" + v2} ${customHook}</p>`;
}

const useBob = () => useFoo();
const useBoof = () => useBob();

const useHey = () => useBar();

function CustomHooks3() {
	const [v] = useHey();
	const [v2] = useBoof();
	return html`<p>Custom hooks: ${"" + v}, ${"" + v2} ${customHook}</p>`;
}

const refOuter = createRef();
function ImperativeHandle() {
	useImperativeHandle(refOuter, () => ({
		focus: () => null,
	}));
	return html`<input />`;
}

function ErrorBoundary1() {
	useErrorBoundary();
	return html`<p>Error Boundary 1</p>`;
}

function ErrorBoundary2() {
	useErrorBoundary(() => null);
	return html`<p>Error Boundary 2</p>`;
}

function useMyHook() {
	const [v, set] = useState(false);
	useDebugValue(v ? "Online" : "Offline");

	return [v, set];
}

function DebugValue() {
	const [v, set] = useMyHook();

	return html`
		<p>Is online: ${"" + v}</p>
		<button onClick=${() => set(!v)} data-testid="debug-hook-toggle">
			Toggle online
		</button>
	`;
}

render(
	html`
		<${Counter} />
		<${CounterCallback} />
		<${CallbackOnly} />
		<${Memo} />
		<${RefComponent} />
		<${Effect} />
		<${Ctx.Provider} value="foobar">
			<${ContextComponent} />
		<//>
		<${ContextNoProvider} />
		<${LayoutEffect} />
		<${ImperativeHandle} />
		<${ErrorBoundary1} />
		<${ErrorBoundary2} />
		<${DebugValue} />
		<${CustomHooks} />
		<${CustomHooks2} />
		<${CustomHooks3} />
	`,
	document.getElementById("app"),
);
