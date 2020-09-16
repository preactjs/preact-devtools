function attachToDevtools(preact) {
	window.__PREACT_DEVTOOLS__.attachPreact("10.0.5", preact.options, {
		Fragment: preact.Fragment,
	});
}
