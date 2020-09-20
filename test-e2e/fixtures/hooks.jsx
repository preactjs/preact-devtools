import { h, Fragment, render, createContext, createRef } from "preact";
import {
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
} from "preact/hooks";

function Display(props) {
	return <div data-testid={props.testId}>Counter: {props.value}</div>;
}

function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<Display value={v} testId="result" />
			<button onClick={() => set(v + 1)}>Increment</button>
		</div>
	);
}

function CallbackOnly() {
	const cb = useCallback(() => 2, []);

	return (
		<div style="padding: 2rem;">
			<Display value="0" testId="callback-result" />
			<button onClick={cb}>Increment</button>
		</div>
	);
}

function CounterCallback() {
	const [v, set] = useState(0);
	const cb = useCallback(() => set(v + 1), [v]);

	return (
		<div style="padding: 2rem;">
			<Display value={v} testId="callback-result" />
			<button onClick={cb}>Increment</button>
		</div>
	);
}

let layoutEffect = 0;
function LayoutEffect() {
	useLayoutEffect(() => {
		layoutEffect++;
	}, []);

	return <p>LayoutEffect: {layoutEffect}</p>;
}

let effect = 0;
function Effect() {
	useEffect(() => {
		effect++;
	}, []);

	return <p>effect: {effect}</p>;
}

function Memo() {
	const v = useMemo(() => 0, []);
	return <p>Memo: {v}</p>;
}

function RefComponent() {
	const v = useRef(0);
	return <p>Ref: {v.current}</p>;
}

const Ctx = createContext(0);

function ContextComponent() {
	const v = useContext(Ctx);
	return <p>Context: {v}</p>;
}

function ContextNoProvider() {
	const v = useContext(Ctx);
	return <p>NoProvider: {v}</p>;
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
	return (
		<p>
			Custom hooks: {"" + v}, {customHook}
		</p>
	);
}

function CustomHooks2() {
	const [v] = useBar();
	const [v2] = useBar();
	return (
		<p>
			Custom hooks: {"" + v}, {"" + v2} {customHook}
		</p>
	);
}

const useBob = () => useFoo();
const useBoof = () => useBob();

const useHey = () => useBar();

function CustomHooks3() {
	const [v] = useHey();
	const [v2] = useBoof();
	return (
		<p>
			Custom hooks: {"" + v}, {"" + v2} ${customHook}
		</p>
	);
}

const refOuter = createRef();
function ImperativeHandle() {
	useImperativeHandle(refOuter, () => ({
		focus: () => null,
	}));
	return <input />;
}

function ErrorBoundary1() {
	useErrorBoundary();
	return <p>Error Boundary 1</p>;
}

function ErrorBoundary2() {
	useErrorBoundary(() => null);
	return <p>Error Boundary 2</p>;
}

function useMyHook() {
	const [v, set] = useState(false);
	useDebugValue(v ? "Online" : "Offline");

	return [v, set];
}

function DebugValue() {
	const [v, set] = useMyHook();

	return (
		<>
			<p>Is online: {"" + v}</p>
			<button onClick={() => set(!v)} data-testid="debug-hook-toggle">
				Toggle online
			</button>
		</>
	);
}

render(
	<>
		<Counter />
		<CounterCallback />
		<CallbackOnly />
		<Memo />
		<RefComponent />
		<Effect />
		<Ctx.Provider value="foobr">
			<ContextComponent />
		</Ctx.Provider>
		<ContextNoProvider />
		<LayoutEffect />
		<ImperativeHandle />
		<ErrorBoundary1 />
		<ErrorBoundary2 />
		<DebugValue />
		<CustomHooks />
		<CustomHooks2 />
		<CustomHooks3 />
	</>,
	document.getElementById("app"),
);
