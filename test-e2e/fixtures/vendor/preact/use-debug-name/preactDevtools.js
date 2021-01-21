function attachToDevtools(preact) {
	window.__PREACT_DEVTOOLS__.attachPreact("10.5.10", preact.options, {
		Fragment: preact.Fragment,
		Component: preact.Component,
	});
}

preactDevtools = {
	addHookName: function (e, o) {
		return preact.options.__a && preact.options.__a(o), e;
	},
};
