function attachToDevtools(preact) {
	window.__PREACT_DEVTOOLS__.attachPreact("10.5.9", preact.options, {
		Fragment: preact.Fragment,
		Component: preact.Component,
	});
}
