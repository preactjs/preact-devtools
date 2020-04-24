function attachToDevtools(preact) {
	const hook =
		typeof window != "undefined" &&
		(window.__PREACT_DEVTOOLS__ || window.parent.__PREACT_DEVTOOLS__);

	if (hook) {
		hook.attachPreact("10.4.2", preact.options, {
			Fragment: preact.Fragment,
			Component: preact.Component,
		});
	}
}
