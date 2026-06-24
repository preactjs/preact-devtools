// Importing `@lynx-js/preact-devtools` is itself the opt-in: in development the
// module is always bundled, and in production `@lynx-js/react-alias-rsbuild-plugin`
// only keeps it (instead of aliasing it to `false`) when the `REACT_DEVTOOL`
// environment variable is set. So whenever this module actually runs, devtools
// is wanted — no extra build-time flag needed.
// Skip setup in test environment because `require` does not work
// in vitest esm env, and `lynx.getDevtool` is not mocked yet
if (process.env.NODE_ENV !== "test") {
	// We cannot use dynamic import here because
	// dynamic import will generate a new lazy bundle
	// which is not what we needed
	require("./setup").setupReactLynx();
}
