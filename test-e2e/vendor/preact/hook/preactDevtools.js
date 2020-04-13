function attachToDevtools(preact) {
	window.__PREACT_DEVTOOLS__.attachPreact("10.4.1", preact.options, {
		Fragment: preact.Fragment,
		Component: preact.Component,
	});
}
